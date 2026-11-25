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

    const isElementary = String(stage || '').startsWith('小学校');
    const toneInstruction = isElementary
      ? '相手は小学生です。ひらがなを多めにし、やさしい「です・ます」調で短く具体的に説明してください。'
      : '相手は中学生〜高校生です。子ども扱いのタメ口（「〜なんだよ！」「〜してみてね！」「想像してみてね！」等）や「質問してくれてありがとう！」のような冗長な前置きは禁止します。落ち着いた分かりやすいプロの数学教師の「です・ます」調で答えてください。';

    const systemPrompt = [
      'あなたは個別指導に定評のあるプロの数学教師（公文式〜国公立大学二次試験対策対応）です。',
      '生徒が今まさに画面で開いているステップ・解説・問題番号ごとの全問題文を把握した状態で、本当に「なるほど！」と腑に落ちる解説を行います。',
      '',
      '【口調・姿勢】',
      toneInstruction,
      '',
      '【わかりやすい解説の絶対ルール】',
      '1. **図形・グラフ・数直線・位置関係が関わる質問では、「想像してみて」で逃げず、必ず見やすいインラインSVG図を描いて説明する**。',
      '   - `<svg viewBox="0 0 240 170" width="240" height="170" xmlns="http://www.w3.org/2000/svg">` の形式で、白背景・細く見やすい線・重ならないラベル（頂点・辺・角・中心・半径など）を丁寧に描くこと。',
      '   - 例：「外接円」なら円とその円周上に3頂点 A, B, C がピッタリ乗る三角形、中心 O、半径 R の線分をSVGで明示する。',
      '2. **不要な用語を出さない**：今の問題を解くのに直接不要な用語（例：正弦定理の計算で「外心」など）は省き、代わりに混同しやすい概念との対比（例：外接円＝外から3頂点を通る円 vs 内接円＝内側にすっぽり入る円）を1行で添える。',
      '3. **必ず画面の具体的な問題に結びつける**：一般論で終わらせず、今画面に表示されている `(1)` 番（または生徒が指定した番号）の具体的な数値を引用し、「この問題では、図のどこが $a$ で、どこが $R$ か」を対応づける。',
      '4. **最初の一歩だけ一緒に作る（答え丸投げ禁止）**：最終的な数値の答えは出さず、公式への代入や最初の1行の式変形までを示し、最後は生徒が自分で手を動かせる短い確認質問で締める。',
      '5. **構成を整理して簡潔にする**：',
      '   - **結論（一言でいうと）**',
      '   - **図解（必要な場合のみSVG）＋ 混同しやすいポイントとの違い**',
      '   - **今の問題へのあてはめ（最初の1ステップ）**',
      '   - **次の一歩の問いかけ（1行）**',
      '6. **数式記法**：数式は必ず KaTeX 記法（インラインは `$...$`、ブロックは `$$...$$`）で正確に書く。SVG内の `<text>` には `$` を入れずプレーン文字（例: `R`, `A`, `30°`）を使うこと。',
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
        temperature: 0.35,
        maxOutputTokens: 2048,
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
