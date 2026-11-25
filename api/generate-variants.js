// Vercel Serverless Function: POST /api/generate-variants
// 同レベル・同問題数の「真の類題」（単なる並び替えや数値入れ替えでない）をGemini APIで構造化JSON生成

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    stepId,
    title,
    stage,
    category,
    questionCount = 10,
    variantNumber = 1,
    originalProblems = [],
  } = req.body || {};

  if (!stepId) {
    return res.status(400).json({ error: 'stepId is required' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY が未設定のためAI類題を生成できません。',
    });
  }

  try {
    const sampleList = Array.isArray(originalProblems)
      ? originalProblems
          .slice(0, 10)
          .map((p, i) => `${i + 1}. 問題: ${p.prompt} / 解答: ${p.answer}`)
          .join('\n')
      : '';

    const prompt = `あなたは日本の数学専門教材作成AI（公文式〜茨城大・筑波大二次試験対策対応）です。
生徒が以下のステップで90%未満だったため、再挑戦用の「類題セット #${variantNumber}」を作成してください。

【厳守ルール】
1. 問題数は厳密に **${questionCount} 問** とすること。
2. 元の問題の「順番を入れ替えただけ」「数字の場所を変えただけ」は**絶対禁止**。同じ学習目標・同じ難易度を保ちながら、式の形・係数・関数・条件・問い方をしっかり変えた新しい類題を作成すること。
3. 数学的に100%正確な解答（途中式の要点＋最終答）を必ず付けること。
4. 数式は必ず KaTeX 記法（$...$）で記述すること。
5. 出力は必ず以下の JSON 形式のみ（余計な前置きやマークダウン記号なし）：
{
  "problems": [
    { "prompt": "問題文（KaTeX可）", "answer": "解答（KaTeX可）" }
  ]
}

【対象ステップ】
- ステージ: ${stage}
- 単元: ${category}
- タイトル: ${title}

【元の問題（これらと重複しない新しい類題を作ること）】
${sampleList}`;

    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: 'application/json',
          maxOutputTokens: 4096,
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
    const rawText =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('')
        .trim() || '';

    const cleaned = rawText
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    const problems = Array.isArray(parsed?.problems)
      ? parsed.problems
          .filter((item) => item && typeof item.prompt === 'string' && typeof item.answer === 'string')
          .slice(0, questionCount)
      : [];

    if (problems.length === 0) {
      return res.status(502).json({ error: '有効な類題データを生成できませんでした。' });
    }

    const markdown = problems
      .map((item, idx) => `${idx + 1}. ${item.prompt}`)
      .join('\n');

    const variant = {
      id: `${stepId}-v${variantNumber}`,
      stepId,
      variantNumber,
      questionCount: problems.length,
      markdown,
      problems,
      createdAt: new Date().toISOString(),
      createdBy: 'gemini',
    };

    return res.status(200).json({ variant, reused: false });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error',
    });
  }
}
