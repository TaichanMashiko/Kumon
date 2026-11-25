// Vercel Serverless Function: POST /api/ask-gemini
// 生徒が今開いているステップ・類題番号・全問題文・解説を正確に受け取り、Gemini でヒント回答を返す

async function callGeminiWithFallback(apiKey, payload) {
  const candidates = Array.from(
    new Set([
      process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      'gemini-3.8-flash',
      'gemini-2.5-flash',
    ])
  );

  let lastStatus = 502;
  let lastErr = '';

  for (const model of candidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return { ok: true, data, model };
    }

    lastStatus = res.status;
    lastErr = await res.text();
    // 404 (model unavailable) の場合のみ次のモデルへフォールバック
    if (res.status !== 404) {
      break;
    }
  }

  return { ok: false, status: lastStatus, errorText: lastErr };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;
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
      '1. 生徒が「(3)番がわからない」「鋭角のときは？」などと聞いたら、今開いている教材の内容や該当番号の問題を具体的に参照して答える。',
      '2. いきなり最終答えだけを投げず、最初の一歩・途中式・考え方をわかりやすく示す。',
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
      ...history.slice(-6).map((msg) => ({
        role: msg.role === 'student' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: question }] },
    ];

    const result = await callGeminiWithFallback(apiKey, {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    if (!result.ok) {
      return res.status(502).json({
        error: `AI先生との通信でエラーが発生しました (${result.status}): ${result.errorText.slice(0, 220)}`,
      });
    }

    const answer =
      result.data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('\n')
        .trim() || '回答を生成できませんでした。もう一度質問してみてください。';

    return res.status(200).json({ answer, model: result.model });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error',
    });
  }
}
