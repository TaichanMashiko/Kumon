// Shared Gemini API helper for all Vercel Serverless Functions
// - Uses active 2026 Gemini models first (gemini-3.8-flash, gemini-3.5-flash-lite, etc.)
// - Retries transient 503/429 spikes
// - Dynamically discovers live generateContent models via GET /v1beta/models if static candidates fail
// - Never lets a fallback 404 mask a primary 503/429 error

const RETRYABLE_STATUS = new Set([404, 429, 500, 502, 503, 504]);

const DEFAULT_MODEL_CANDIDATES = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    ''
  ).trim();
}

/**
 * Gemini API が受け付ける厳密な交互ロール (user -> model -> user) に正規化する
 * 失敗した前回の質問が残って user が2回連続するケースを防ぐ
 */
export function sanitizeGeminiContents(contents) {
  const merged = [];
  for (const item of contents || []) {
    if (!item || !Array.isArray(item.parts) || item.parts.length === 0) continue;
    const role = item.role === 'model' ? 'model' : 'user';
    const textParts = item.parts
      .filter((p) => p && typeof p.text === 'string' && p.text.trim().length > 0)
      .map((p) => ({ text: p.text }));
    if (textParts.length === 0) continue;

    const prev = merged[merged.length - 1];
    if (prev && prev.role === role) {
      prev.parts.push(...textParts);
    } else {
      merged.push({ role, parts: textParts });
    }
  }
  // 最後が model で終わる場合は削除（Gemini 3 世代は末尾 model を 400 で拒否する）
  while (merged.length > 0 && merged[merged.length - 1].role === 'model') {
    merged.pop();
  }
  return merged;
}

/**
 * ユーザーの API キーで現在利用可能な generateContent 対応モデルを動的に取得する
 */
export async function discoverLiveGeminiModels(apiKey, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(
      'https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',
      {
        method: 'GET',
        headers: { 'x-goog-api-key': apiKey },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const models = Array.isArray(data?.models) ? data.models : [];

    const usable = models
      .filter((m) => {
        const name = String(m?.name || '');
        const methods = Array.isArray(m?.supportedGenerationMethods)
          ? m.supportedGenerationMethods
          : [];
        if (!methods.includes('generateContent')) return false;
        const short = name.replace(/^models\//, '');
        if (!short.startsWith('gemini-')) return false;
        // 音声・画像専用・埋め込み・極端な実験専用モデルを除外
        if (/(embedding|imagen|image|tts|audio|live|veo|robotics|computer-use)/i.test(short)) {
          return false;
        }
        return true;
      })
      .map((m) => String(m.name).replace(/^models\//, ''));

    // Flash / Lite / 新バージョンを優先順位付け
    const scoreModel = (id) => {
      let score = 0;
      if (id.includes('flash')) score += 50;
      if (id.includes('lite')) score += 10;
      if (!id.includes('exp') && !id.includes('preview')) score += 20;
      const verMatch = id.match(/gemini-(\d+(?:\.\d+)?)/);
      if (verMatch) score += parseFloat(verMatch[1]) * 10;
      return score;
    };

    return usable.sort((a, b) => scoreModel(b) - scoreModel(a));
  } catch {
    return [];
  }
}

/**
 * 堅牢な Gemini generateContent 呼び出し
 * 1. 環境変数 GEMINI_MODEL + 現行アクティブモデル群を順に試行（503/429はリトライ）
 * 2. 全滅した場合、GET /v1beta/models から実在モデルを動的発見して試行
 * 3. エラー時は 404 で 503/429 を上書きしない
 */
export async function callGeminiRobust(apiKey, payload, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const retryDelayMs = options.retryDelayMs ?? 600;

  const normalizedPayload = payload?.contents
    ? { ...payload, contents: sanitizeGeminiContents(payload.contents) }
    : payload;

  const initialCandidates = Array.from(
    new Set(
      [process.env.GEMINI_MODEL, ...DEFAULT_MODEL_CANDIDATES]
        .map((m) => String(m || '').trim())
        .filter(Boolean)
    )
  );

  const tried = new Set();
  const attemptLog = [];
  let hadBusy = false;
  let hadAuthError = false;
  let lastStatus = 502;
  let lastErr = '';

  const tryModelList = async (modelList, allowRetryPrimary) => {
    for (let idx = 0; idx < modelList.length; idx += 1) {
      const model = modelList[idx];
      if (tried.has(model)) continue;
      tried.add(model);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const maxAttempts = allowRetryPrimary && idx === 0 ? 2 : 1;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        let res;
        try {
          res = await fetchImpl(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(normalizedPayload),
          });
        } catch (netErr) {
          lastStatus = 503;
          lastErr = netErr instanceof Error ? netErr.message : 'Network error';
          attemptLog.push(`${model}:NET_ERR`);
          hadBusy = true;
          break;
        }

        if (res.ok) {
          const data = await res.json();
          return { ok: true, data, model, attemptLog };
        }

        const errText = await res.text().catch(() => '');
        attemptLog.push(`${model}:${res.status}`);
        lastStatus = res.status;
        lastErr = errText;

        if (res.status === 401 || res.status === 403) {
          hadAuthError = true;
          return {
            ok: false,
            status: res.status,
            errorText: errText,
            hadBusy,
            hadAuthError,
            attemptLog,
          };
        }

        if (res.status === 503 || res.status === 429) {
          hadBusy = true;
          if (attempt < maxAttempts) {
            await sleep(retryDelayMs);
            continue;
          }
          break;
        }

        if (!RETRYABLE_STATUS.has(res.status)) {
          return {
            ok: false,
            status: res.status,
            errorText: errText,
            hadBusy,
            hadAuthError,
            attemptLog,
          };
        }
        break;
      }
    }
    return null;
  };

  // Phase 1: Try known active models
  const firstResult = await tryModelList(initialCandidates, true);
  if (firstResult) return firstResult;

  // Phase 2: Dynamically discover live models available for this exact API key!
  const discovered = await discoverLiveGeminiModels(apiKey, fetchImpl);
  const remaining = discovered.filter((m) => !tried.has(m)).slice(0, 6);
  if (remaining.length > 0) {
    const secondResult = await tryModelList(remaining, false);
    if (secondResult) return secondResult;
  }

  // Never let a fallback 404 mask a genuine 503/429 high-demand spike
  const finalStatus = hadAuthError ? 403 : hadBusy ? 503 : lastStatus;
  return {
    ok: false,
    status: finalStatus,
    errorText: lastErr,
    hadBusy,
    hadAuthError,
    attemptLog,
  };
}

export function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('\n')
      .trim() || ''
  );
}
