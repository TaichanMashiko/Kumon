// Vercel Serverless Function: POST /api/ask-gemini
// 生徒の質問に対して、Gemini APIでスモールステップのヒント・解説を返す

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error:
        'GEMINI_API_KEY が Vercel の環境変数に設定されていません。Vercelダッシュボードで GEMINI_API_KEY を設定してください。',
    });
  }

  try {
    const {
      stepId,
      stepTitle,
      stage,
      stepMarkdown,
      question,
      history = [],
    } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '質問内容を入力してください。' });
    }

    const systemPrompt = [
      'あなたは公文式デジタル数学学習システム「MathStep」の専属AI数学チューターです。',
      '小学生レベルの生徒でも、独学でスモールステップを積み上げて大学受験レベルまで到達できるよう指導します。',
      '【指導ルール】',
      '1. 答えをいきなり丸投げせず、まず生徒がどこで止まっているかに寄り添い、最初の一歩（ヒントや途中式）をやさしく示す。',
      '2. 数式は必ず KaTeX 記法（インラインは $...$、ブロックは $$...$$）で正確に書く。',
      '3. 専門用語を使うときは、中学生・小学生にもイメージできる言い換えを添える。',
      '4. ノートに鉛筆で書いて確認できるよう、短く簡潔に（原則300文字〜500文字程度）まとめる。',
    ].join('\n');

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `【現在の学習ステップ】\nID: ${stepId}\nタイトル: ${stepTitle}\nステージ: ${stage}\n\n【教材内容】\n${(stepMarkdown || '').slice(0, 3500)}`,
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: '承知しました。この教材内容に合わせて、生徒の質問にわかりやすくスモールステップでお答えします。',
          },
        ],
      },
      ...history.slice(-6).map((msg) => ({
        role: msg.role === 'student' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ text: question }],
      },
    ];

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({
        error: `Gemini API エラー (${geminiRes.status}): ${errText.slice(0, 200)}`,
      });
    }

    const data = await geminiRes.json();
    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('\n')
        .trim() || '回答を生成できませんでした。もう一度質問してみてください。';

    return res.status(200).json({ answer, model });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error',
    });
  }
}
