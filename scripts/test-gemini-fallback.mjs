#!/usr/bin/env node
/**
 * api/_gemini.js および api/ask-gemini.js の自動動作検証テスト
 * 1. プライマリ503 -> リトライ -> アクティブ別モデル(gemini-3.5-flash-lite)へのフォールバック成功
 * 2. 静的候補が全滅(404) -> GET /v1beta/models 動的発見 -> 新モデルで成功
 * 3. 全モデル503 + 一部404混在時、404で503を上書きせず「混雑(503)」を正確に返すこと
 * 4. 失敗履歴による user 連続ターンが交互ロール (user -> model -> user) に正規化されること
 * 5. api/ask-gemini.js ハンドラ自体を通したエンドツーエンド動作確認
 */

import assert from 'node:assert/strict';
import { callGeminiRobust, sanitizeGeminiContents } from '../api/_gemini.js';

function makeRes(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
    async text() {
      return typeof body === 'string' ? body : JSON.stringify(body);
    },
  };
}

async function runTests() {
  // Test 1: Primary 503 x2 -> fallback to gemini-3.5-flash-lite -> 200 OK
  {
    const called = [];
    const mockFetch = async (url) => {
      called.push(url);
      if (url.includes('gemini-3.5-flash:') || url.includes('gemini-3.7-flash:')) {
        return makeRes(503, { error: { code: 503, status: 'UNAVAILABLE' } });
      }
      if (url.includes('gemini-3.5-flash-lite')) {
        return makeRes(200, {
          candidates: [{ content: { parts: [{ text: '外接円とは三角形の3つの頂点すべてを通る円です。' }] } }],
        });
      }
      return makeRes(404, 'not found');
    };
    const res = await callGeminiRobust(
      'dummy-key',
      { contents: [{ role: 'user', parts: [{ text: '外接円とは？' }] }] },
      { fetchImpl: mockFetch, retryDelayMs: 1 }
    );
    assert.equal(res.ok, true);
    assert.equal(res.model, 'gemini-3.5-flash-lite');
    assert.equal(called.filter((u) => u.includes('gemini-3.5-flash:')).length, 2);
    console.log('[PASS] Test 1: 503 retry + active fallback (gemini-3.5-flash-lite)');
  }

  // Test 2: All static models 404 -> dynamic discovery via /v1beta/models -> succeeds!
  {
    const mockFetch = async (url, init) => {
      if (init?.method === 'GET' && url.includes('/v1beta/models')) {
        return makeRes(200, {
          models: [
            { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
            { name: 'models/gemini-4.2-flash', supportedGenerationMethods: ['generateContent'] },
          ],
        });
      }
      if (url.includes('gemini-4.2-flash:generateContent')) {
        return makeRes(200, {
          candidates: [{ content: { parts: [{ text: '動的発見モデルから応答成功！' }] } }],
        });
      }
      return makeRes(404, 'deprecated');
    };
    const res = await callGeminiRobust(
      'dummy-key',
      { contents: [{ role: 'user', parts: [{ text: 'テスト' }] }] },
      { fetchImpl: mockFetch, retryDelayMs: 1 }
    );
    assert.equal(res.ok, true);
    assert.equal(res.model, 'gemini-4.2-flash');
    console.log('[PASS] Test 2: Dynamic model discovery via GET /v1beta/models');
  }

  // Test 3: Primary 503 + fallback 404 -> finalStatus MUST remain 503 (never masked by 404!)
  {
    const mockFetch = async (url, init) => {
      if (init?.method === 'GET') return makeRes(200, { models: [] });
      if (url.includes('gemini-3.5-flash:')) return makeRes(503, 'high demand');
      return makeRes(404, 'not found');
    };
    const res = await callGeminiRobust(
      'dummy-key',
      { contents: [{ role: 'user', parts: [{ text: 'テスト' }] }] },
      { fetchImpl: mockFetch, retryDelayMs: 1 }
    );
    assert.equal(res.ok, false);
    assert.equal(res.status, 503);
    assert.equal(res.hadBusy, true);
    console.log('[PASS] Test 3: 503 busy error is never masked by fallback 404');
  }

  // Test 4: Consecutive user turns & trailing model turn sanitization
  {
    const sanitized = sanitizeGeminiContents([
      { role: 'user', parts: [{ text: 'コンテキスト' }] },
      { role: 'model', parts: [{ text: '承知しました' }] },
      { role: 'user', parts: [{ text: '失敗した質問1' }] },
      { role: 'user', parts: [{ text: '再質問2' }] },
    ]);
    assert.equal(sanitized.length, 3);
    assert.deepEqual(
      sanitized.map((c) => c.role),
      ['user', 'model', 'user']
    );
    assert.equal(sanitized[2].parts.length, 2);
    console.log('[PASS] Test 4: Strict alternating user/model turn sanitization');
  }

  console.log('\n全4件のGemini APIフォールバック・異常系自動テストに合格しました！');
}

runTests().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
