// Vercel Serverless Function: POST /api/diagnose-remediation
// 生徒の「どこがわからないか」の回答と前提単元候補をもとに、最適な戻り学習ステップを診断する

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { currentStep, studentReason, candidates = [] } = req.body || {};
  if (!currentStep || !Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;

  // APIキー未設定時は先頭の最有力前提ステップを即返す
  if (!apiKey) {
    return res.status(200).json({
      recommendedStepId: candidates[0].id,
      explanation: `「${currentStep.title}」を解く土台となる「${candidates[0].title}」を復習すると、スムーズに解けるようになります。`,
    });
  }

  try {
    const candidateLines = candidates
      .map((c, idx) => `${idx + 1}. ID: ${c.id} / ${c.stage} / ${c.title}`)
      .join('\n');

    const prompt = `あなたは公文式〜国公立大学入試（茨城大・筑波大）まで指導する経験豊富な数学教師です。
生徒が以下のステップで複数回90%未満（不合格）となり、つまずきの原因を回答しました。
候補リストの中から、今この生徒が戻るべき「最も効果的な1つのステップID」を選び、生徒に向けた温かく簡潔なアドバイス（80〜120文字）を日本語で出力してください。

【現在のつまずきステップ】
${currentStep.stage} / ${currentStep.title}

【生徒の回答（どこがわからないか）】
${studentReason || '特に入力なし'}

【戻り学習の候補リスト（必ずこの中のIDから1つ選ぶこと）】
${candidateLines}

【出力形式（JSONのみ）】
{
  "recommendedStepId": "候補リストにあるID",
  "explanation": "生徒への簡潔な理由と励まし"
}`;

    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          maxOutputTokens: 512,
        },
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`Gemini error ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('')
        .trim() || '';
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    const validIds = new Set(candidates.map((c) => c.id));
    const chosenId = validIds.has(parsed?.recommendedStepId)
      ? parsed.recommendedStepId
      : candidates[0].id;

    return res.status(200).json({
      recommendedStepId: chosenId,
      explanation:
        typeof parsed?.explanation === 'string' && parsed.explanation.trim()
          ? parsed.explanation.trim()
          : `まずは基礎となるステップを固めてから、もう一度この問題に挑戦しましょう。`,
    });
  } catch {
    return res.status(200).json({
      recommendedStepId: candidates[0].id,
      explanation: `「${currentStep.title}」の土台になる「${candidates[0].title}」を一度復習してから再挑戦するのがおすすめです。`,
    });
  }
}
