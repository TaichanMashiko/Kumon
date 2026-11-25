// Vercel Serverless Function: GET /api/health-gemini
// APIキーを露出せず、現在利用可能なGeminiモデルと疎通確認のみを返す診断エンドポイント

import {
  callGeminiRobust,
  discoverLiveGeminiModels,
  extractGeminiText,
  getGeminiApiKey,
} from './_gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: 'GEMINI_API_KEY is not configured',
    });
  }

  const discovered = await discoverLiveGeminiModels(apiKey);
  const result = await callGeminiRobust(apiKey, {
    contents: [{ role: 'user', parts: [{ text: '「OK」とだけ答えてください。' }] }],
    generationConfig: { maxOutputTokens: 16, temperature: 0 },
  });

  if (!result.ok) {
    return res.status(502).json({
      ok: false,
      status: result.status,
      discoveredTopModels: discovered.slice(0, 8),
      attemptLog: result.attemptLog,
    });
  }

  return res.status(200).json({
    ok: true,
    activeModel: result.model,
    reply: extractGeminiText(result.data),
    discoveredTopModels: discovered.slice(0, 8),
    attemptLog: result.attemptLog,
  });
}
