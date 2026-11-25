// Vercel Serverless Function: POST /api/generate-variants
// 同レベルの類題を同問題数で生成し、Upstash Redis / Vercel KV が設定されていれば永続保存して全生徒で再利用する

async function kvGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.result) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}

async function kvSet(key, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;

  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
  return res.ok;
}

// 同一インスタンス内でのフォールバック共有キャッシュ
const memoryVariantCache = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    stepId,
    title,
    stage,
    category,
    questionCount = 4,
    variantNumber = 1,
    originalMarkdown = '',
  } = req.body || {};

  if (!stepId) {
    return res.status(400).json({ error: 'stepId is required' });
  }

  const cacheKey = `mathstep:variant:${stepId}:v${variantNumber}`;

  // 1. Check shared KV / memory cache first -> Reuse across all students!
  const kvHit = await kvGet(cacheKey);
  if (kvHit) {
    return res.status(200).json({ variant: kvHit, reused: true });
  }
  if (memoryVariantCache.has(cacheKey)) {
    return res
      .status(200)
      .json({ variant: memoryVariantCache.get(cacheKey), reused: true });
  }

  // 2. Generate new variant set using Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error:
        '新規の類題を生成するには Vercel の環境変数に GEMINI_API_KEY を設定してください。',
    });
  }

  try {
    const prompt = `あなたは公文式デジタル数学教材の作成AIです。
以下のオリジナル教材と同じ難易度・同じ単元・同じ問題数（厳密に ${questionCount} 問）で、数値や関数を変えた新しい類題セット（類題 #${variantNumber}）を作成してください。

【教材情報】
- ステップID: ${stepId}
- タイトル: ${title}
- ステージ: ${stage} / ${category}
- 問題数: 厳密に ${questionCount} 問

【出力フォーマット（厳守）】
Markdown のみを出力してください（コードブロック \`\`\` で囲まないこと）。
数式は必ず KaTeX 記法（$...$ / $$...$$）を使ってください。

# ✍️ 類題トレーニング #${variantNumber}（全${questionCount}問）

90%以上を目指して、手元のノートに鉛筆で解きましょう！

1. （問題1）
...
${questionCount}. （問題${questionCount}）

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. （途中式と答え）
...
${questionCount}. （途中式と答え）

</details>

【参考：オリジナル教材】
${originalMarkdown.slice(0, 3000)}`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
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
    let markdown =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('\n')
        .trim() || '';

    // Strip accidental outer markdown fences
    markdown = markdown.replace(/^```(?:markdown|md)?\n/i, '').replace(/\n```$/, '');

    const variant = {
      id: `${stepId}-v${variantNumber}`,
      stepId,
      variantNumber,
      questionCount,
      markdown,
      createdAt: new Date().toISOString(),
      createdBy: 'gemini',
    };

    // Save to shared cache so future students reuse it with zero API calls
    memoryVariantCache.set(cacheKey, variant);
    await kvSet(cacheKey, variant);

    return res.status(200).json({ variant, reused: false });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error',
    });
  }
}
