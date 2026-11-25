// Vercel Serverless Function: POST /api/triage-feedback
// テストプレイヤーからのご意見・報告を Gemini API で判定し、
// 採用 / 保留 / 方針却下 / ノイズ除外 と「ルール自動アップデート案」を返す

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { category, message, stepId, stepTitle } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Missing feedback message' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      decision: 'pending_corroboration',
      priority: 'LOW',
      reason: 'APIキー未設定のため一時保留（次回の定期バッチで再判定）',
      judgedBy: 'fallback',
      suggestedRuleUpdate: { target: 'none', pattern: '' },
    });
  }

  const prompt = `あなたは公文式スモールステップ〜全国国公立大学入試（茨城大・筑波大レベル以上）まで到達させる数学学習アプリ「マスステップ」の品質管理AIです。
テストプレイヤーから届いた以下のご意見・不具合報告を厳正に判定してください。

【絶対原則（これに反する要望は必ず rejected にすること）】
1. 生徒の学習状況データをもとに学力を最大限に伸ばすこと。
2. 自習モードの90%以上厳格合格・スモールステップ徹底・大学入試対応の質を下げないこと。

【判定区分（decision）】
- "ignored": 意味のない文字・抽象的すぎる感想（「むずい」「わからん」等）・具体性のないスパム/テスト投稿。
- "rejected": 90%合格基準の緩和、答えの常時表示、ステップのスキップなど上記2原則に反する甘やかし要望。
- "adopted": 数学的な誤り、解説と問題のズレ、数式表示崩れ、APIエラー、学習効果を高める具体的な改善提案。
- "pending_corroboration": 好み・UI・難易度に関する単発の主観的意見（複数名の報告や学習ログの裏付けを待つ）。

【入力データ】
- カテゴリ: ${category || '未指定'}
- 対象ステップ: ${stepId ? `${stepId} (${stepTitle || ''})` : '全体'}
- 内容: ${message.trim()}

【さらに重要なタスク：ルールの自動学習】
今回の投稿から、今後の自動フィルタリング精度を上げるために \`noiseKeywords\` / \`policyConflictKeywords\` / \`highSignalBugKeywords\` のいずれかに追加すべき「汎用的な短い日本語フレーズ（3〜12文字）」が抽出できる場合は \`suggestedRuleUpdate\` に提案してください。不要なら \`target: "none"\` としてください。

【出力形式（JSONのみ）】
{
  "decision": "adopted" | "pending_corroboration" | "rejected" | "ignored",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "reason": "日本語での簡潔な判定理由（40〜90文字）",
  "suggestedRuleUpdate": {
    "target": "noiseKeywords" | "policyConflictKeywords" | "highSignalBugKeywords" | "none",
    "pattern": "抽出フレーズまたは空文字"
  }
}`;

  const models = Array.from(
    new Set([
      process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
    ])
  );
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const geminiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            maxOutputTokens: 512,
          },
        }),
      });

      if (!geminiRes.ok) {
        if ([404, 429, 500, 502, 503, 504].includes(geminiRes.status)) continue;
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

      const validDecisions = new Set(['adopted', 'pending_corroboration', 'rejected', 'ignored']);
      const validTargets = new Set([
        'noiseKeywords',
        'policyConflictKeywords',
        'highSignalBugKeywords',
        'none',
      ]);

      return res.status(200).json({
        decision: validDecisions.has(parsed?.decision)
          ? parsed.decision
          : 'pending_corroboration',
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(parsed?.priority)
          ? parsed.priority
          : 'LOW',
        reason:
          typeof parsed?.reason === 'string' && parsed.reason.trim()
            ? parsed.reason.trim()
            : 'AIによる自動判定を実施しました。',
        judgedBy: model,
        suggestedRuleUpdate: {
          target: validTargets.has(parsed?.suggestedRuleUpdate?.target)
            ? parsed.suggestedRuleUpdate.target
            : 'none',
          pattern:
            typeof parsed?.suggestedRuleUpdate?.pattern === 'string'
              ? parsed.suggestedRuleUpdate.pattern.trim().slice(0, 24)
              : '',
        },
      });
    } catch {
      // try next fallback model
    }
  }

  return res.status(200).json({
    decision: 'pending_corroboration',
    priority: 'LOW',
    reason: 'AI判定が一時利用不可のため保留（次回バッチで再判定）',
    judgedBy: 'fallback',
    suggestedRuleUpdate: { target: 'none', pattern: '' },
  });
}
