// Vercel Serverless Function: POST /api/ask-gemini
// 生徒が今開いているステップ・類題番号・全問題文・解説を正確に受け取り、Gemini でヒント回答を返す

import {
  callGeminiRobust,
  extractGeminiText,
  getGeminiApiKey,
} from './_gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      error:
        'Gemini APIキーが未設定です。Vercelの環境変数に GEMINI_API_KEY を設定してください。',
    });
  }

  try {
    const {
      stepId,
      stepTitle,
      stage,
      category,
      variantNumber = 0,
      explanation = '',
      problems = [],
      question,
      history = [],
    } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '質問内容を入力してください。' });
    }

    const problemContext = Array.isArray(problems)
      ? problems
          .map((p, i) => `(${i + 1}) 問題: ${p.prompt} ／ 正解: ${p.answer}`)
          .join('\n')
      : '';

    const systemPrompt = [
      'あなたは公文式デジタル数学学習システム「マスステップ」の専属AI数学先生です。',
      '生徒が今まさに画面で開いているステップ・解説・問題番号ごとの全問題文をすべて把握した状態で回答します。',
      '【指導ルール】',
      '1. 生徒が「(3)番がわからない」「そもそも外接円って何？」などと聞いたら、今開いている教材の内容や該当番号の問題・基礎用語を具体的にわかりやすく答える。',
      '2. いきなり最終答えだけを投げず、最初の一歩・途中式・考え方を段階的に示す。',
      '3. 数式は必ず KaTeX 記法（インラインは $...$、ブロックは $$...$$）で正確に書く。',
      '4. ノートに鉛筆で書いて確認できるよう、簡潔で親しみやすい日本語（300〜500文字程度）で答える。',
    ].join('\n');

    const contextMessage = [
      `【生徒が今開いている画面の情報】`,
      `- ステップID: ${stepId}${variantNumber > 0 ? `（類題 #${variantNumber}）` : '（通常問題）'}`,
      `- ステージ / 単元: ${stage} / ${category || ''}`,
      `- タイトル: ${stepTitle}`,
      ``,
      `【画面の解説】`,
      explanation,
      ``,
      `【画面に表示されている問題一覧】`,
      problemContext,
    ].join('\n');

    const validHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .filter((msg) => msg && typeof msg.text === 'string' && msg.text.trim())
          .map((msg) => ({
            role: msg.role === 'student' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          }))
      : [];

    const contents = [
      { role: 'user', parts: [{ text: contextMessage }] },
      {
        role: 'model',
        parts: [
          {
            text: '承知しました。今開いているステップの解説と各番号の問題を把握しました。生徒の質問にわかりやすく答えます。',
          },
        ],
      },
      ...validHistory,
      { role: 'user', parts: [{ text: question }] },
    ];

    const result = await callGeminiRobust(apiKey, {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    if (!result.ok) {
      console.error('[ask-gemini] All candidates failed:', result.attemptLog, result.errorText?.slice(0, 200));
      const friendlyMsg = result.hadAuthError
        ? 'AI先生のAPIキー設定に問題があります。先生または管理者へお知らせください。'
        : result.hadBusy || result.status === 503 || result.status === 429
        ? 'ただいまAI先生が大変混み合っています。5〜10秒ほど待ってから「もう一度送信」を押してください。'
        : `AI先生との通信に失敗しました（エラー ${result.status}）。少し時間を置いて再度お試しください。`;
      return res
        .status(result.hadBusy || result.status === 503 || result.status === 429 ? 503 : 502)
        .json({ error: friendlyMsg });
    }

    const answer =
      extractGeminiText(result.data) ||
      '回答を生成できませんでした。もう一度質問してみてください。';

    return res.status(200).json({ answer, model: result.model });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error',
    });
  }
}
