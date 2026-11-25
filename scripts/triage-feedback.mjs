#!/usr/bin/env node
/**
 * Gemini API 連携・自己学習型 テストプレイヤー意見トリアージ＆ルール自動アップデートパイプライン
 *
 * 1. config/feedback-triage-rules.json から現在の判定ルールを読み込み
 * 2. 未判定のフィードバックを Gemini API で厳正に判定（採用 / 保留 / 方針却下 / ノイズ除外）
 *    ※ アプリ送信時に /api/triage-feedback で判定済みの場合はその結果を活用
 * 3. Gemini API が抽出した新規パターン（suggestedRuleUpdate）を検証し、
 *    config/feedback-triage-rules.json を自動でバージョンアップ＆変更履歴を記録
 * 4. logs/feedback-triage-report.md に「採用・保留・却下」と「自動アップデートされたルール一覧」を報告
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const RULES_PATH = path.join(ROOT_DIR, 'config', 'feedback-triage-rules.json');
const REPORT_PATH = path.join(LOGS_DIR, 'feedback-triage-report.md');

async function loadRules() {
  const raw = await fs.readFile(RULES_PATH, 'utf8');
  return JSON.parse(raw);
}

async function judgeWithGeminiAPI(item, rules) {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;
  if (!apiKey) return null;

  const prompt = `あなたは公文式スモールステップ〜全国国公立大学入試（茨城大・筑波大レベル以上）まで到達させる数学学習アプリ「マスステップ」の品質管理AIです。
以下のテストプレイヤー意見を判定し、必要なら今後のルール更新案を提案してください。

【絶対原則】
1. 生徒の学習状況データをもとに学力を伸ばすこと。
2. 自習モード90%合格基準・スモールステップ徹底・大学入試対応の質を下げないこと。

【現在の登録済みキーワード（重複提案を避けること）】
- noiseKeywords: ${JSON.stringify(rules.noiseKeywords)}
- policyConflictKeywords: ${JSON.stringify(rules.policyConflictKeywords)}
- highSignalBugKeywords: ${JSON.stringify(rules.highSignalBugKeywords)}

【入力データ】
- カテゴリ: ${item.category || '未指定'}
- 対象ステップ: ${item.stepId || '全体'}
- 内容: ${String(item.message || '').trim()}

【出力JSON】
{
  "decision": "adopted" | "pending_corroboration" | "rejected" | "ignored",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "reason": "日本語での簡潔な判定理由",
  "suggestedRuleUpdate": {
    "target": "noiseKeywords" | "policyConflictKeywords" | "highSignalBugKeywords" | "none",
    "pattern": "新しく追加すべき汎用的な短い日本語フレーズ（不要なら空文字）"
  }
}`;

  const models = [
    process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
  ];
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(endpoint, {
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
      if (!res.ok) {
        if (res.status === 404) continue;
        return null;
      }
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || '')
          .join('')
          .trim() || '';
      const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        decision: parsed.decision || 'pending_corroboration',
        priority: parsed.priority || 'LOW',
        reason: parsed.reason || 'Gemini APIによる判定',
        judgedBy: model,
        suggestedRuleUpdate: parsed.suggestedRuleUpdate || { target: 'none', pattern: '' },
      };
    } catch {
      // try fallback
    }
  }
  return null;
}

function fallbackRuleJudge(item, rules, seenMessages, bottleneckStepIds) {
  const raw = String(item.message || '').trim();
  const compact = raw.replace(/\s+/g, '');

  if (compact.length < 10 || /^(.)\1{4,}$/.test(compact) || new Set(compact).size <= 2) {
    return {
      decision: 'ignored',
      priority: 'LOW',
      reason: 'ルール判定（ノイズ除外）: 10文字未満または無意味な文字繰り返し',
      judgedBy: `rules-v${rules.version}`,
    };
  }
  const dedupeKey = `${item.stepId || ''}::${compact.toLowerCase()}`;
  if (seenMessages.has(dedupeKey)) {
    return {
      decision: 'ignored',
      priority: 'LOW',
      reason: 'ルール判定（重複除外）: 同一内容の重複報告',
      judgedBy: `rules-v${rules.version}`,
    };
  }
  seenMessages.add(dedupeKey);

  if ((rules.noiseKeywords || []).some((kw) => compact === kw || raw === kw)) {
    return {
      decision: 'ignored',
      priority: 'LOW',
      reason: 'ルール判定（ノイズ除外）: 学習済みノイズキーワードに一致',
      judgedBy: `rules-v${rules.version}`,
    };
  }

  if ((rules.policyConflictKeywords || []).some((kw) => raw.includes(kw))) {
    return {
      decision: 'rejected',
      priority: 'LOW',
      reason: 'ルール判定（方針不一致により却下）: 学習済み方針不一致ルールに一致',
      judgedBy: `rules-v${rules.version}`,
    };
  }

  const isBug =
    item.category === '問題のミス・解説のズレ' ||
    (rules.highSignalBugKeywords || []).some((kw) => raw.includes(kw));
  if (isBug) {
    return {
      decision: 'adopted',
      priority: 'HIGH',
      reason: 'ルール判定（採用・最優先検証）: 問題の誤り・解説ズレ・不具合の指摘',
      judgedBy: `rules-v${rules.version}`,
    };
  }

  if (item.stepId && bottleneckStepIds.has(item.stepId)) {
    return {
      decision: 'adopted',
      priority: 'MEDIUM',
      reason: 'ルール判定（採用・ログ裏付けあり）: 低正答率ステップの学習ログと一致',
      judgedBy: `rules-v${rules.version}`,
    };
  }

  return {
    decision: 'pending_corroboration',
    priority: 'LOW',
    reason: 'ルール判定（保留）: 複数報告または学習ログの裏付け待ち',
    judgedBy: `rules-v${rules.version}`,
  };
}

function applyRuleUpdateIfValid(rules, update, sourceMessage, today) {
  if (!update || !update.target || update.target === 'none') return null;
  const validTargets = ['noiseKeywords', 'policyConflictKeywords', 'highSignalBugKeywords'];
  if (!validTargets.includes(update.target)) return null;

  const pattern = String(update.pattern || '').trim();
  if (pattern.length < 2 || pattern.length > 24) return null;

  const list = rules[update.target] || [];
  if (list.includes(pattern)) return null;

  list.push(pattern);
  rules[update.target] = list;
  const logEntry = {
    date: today,
    target: update.target,
    addedPattern: pattern,
    sourceExcerpt: String(sourceMessage || '').slice(0, 40),
  };
  rules.ruleChangeLog = [...(rules.ruleChangeLog || []), logEntry].slice(-100);
  return logEntry;
}

async function main() {
  const rules = await loadRules();
  const files = await fs.readdir(LOGS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const feedbackItems = [];
  const bottleneckStepIds = new Set();

  for (const f of jsonFiles) {
    try {
      const parsed = JSON.parse(await fs.readFile(path.join(LOGS_DIR, f), 'utf8'));
      if (Array.isArray(parsed.tester_feedback)) {
        feedbackItems.push(...parsed.tester_feedback);
      }
      if (Array.isArray(parsed.steps)) {
        for (const s of parsed.steps) {
          const acc = s.accuracy_samples ?? [];
          const avg = acc.length ? acc.reduce((a, b) => a + b, 0) / acc.length : 100;
          if (avg < 70) bottleneckStepIds.add(s.step_id);
        }
      }
    } catch {
      // skip invalid json
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  const results = [];
  const appliedRuleChanges = [];

  for (const item of feedbackItems) {
    let triage = item.aiTriage || (await judgeWithGeminiAPI(item, rules));
    if (!triage) {
      triage = fallbackRuleJudge(item, rules, seen, bottleneckStepIds);
    }
    const added = applyRuleUpdateIfValid(rules, triage.suggestedRuleUpdate, item.message, today);
    if (added) appliedRuleChanges.push(added);
    results.push({ ...item, triage });
  }

  if (appliedRuleChanges.length > 0) {
    rules.version = Number(rules.version || 1) + 1;
    rules.updatedAt = today;
    await fs.writeFile(RULES_PATH, JSON.stringify(rules, null, 2) + '\n', 'utf8');
  }

  const adopted = results.filter((r) => r.triage.decision === 'adopted');
  const pending = results.filter((r) => r.triage.decision === 'pending_corroboration');
  const rejected = results.filter((r) => r.triage.decision === 'rejected');
  const ignored = results.filter((r) => r.triage.decision === 'ignored');

  const lines = [
    `# テストプレイヤー意見 Gemini API トリアージ＆ルール自動更新レポート`,
    ``,
    `- 実行日: ${today}`,
    `- 現行トリアージルール: **v${rules.version}**（最終更新: ${rules.updatedAt} / \`config/feedback-triage-rules.json\`）`,
    `- 総受信件数: **${results.length} 件**（採用: ${adopted.length} / 保留: ${pending.length} / 方針却下: ${rejected.length} / ノイズ除外: ${ignored.length}）`,
    ``,
    `## 1. 今回自動アップデートされたトリアージルール`,
    appliedRuleChanges.length === 0
      ? '今回の実行では新規ルールの追加はありませんでした（既存ルール v' + rules.version + ' を維持）。'
      : appliedRuleChanges
          .map(
            (c) =>
              `- \`${c.target}\` に **「${c.addedPattern}」** を自動追加（根拠投稿: 「${c.sourceExcerpt}…」）`
          )
          .join('\n'),
    ``,
    `## 2. 採用（修正・アップデート対象）`,
    adopted.length === 0
      ? '現在、新規の採用対象はありません。'
      : adopted
          .map(
            (r) =>
              `- **[${r.triage.priority} / ${r.triage.judgedBy}]** ${r.stepId ? `\`${r.stepId}\` ` : ''}${r.message} — *${r.triage.reason}*`
          )
          .join('\n'),
    ``,
    `## 3. 保留（複数報告・学習ログ裏付け待ち）`,
    pending.length === 0
      ? '現在、保留中の要望はありません。'
      : pending
          .map(
            (r) =>
              `- **[${r.triage.judgedBy}]** ${r.stepId ? `\`${r.stepId}\` ` : ''}${r.message} — *${r.triage.reason}*`
          )
          .join('\n'),
    ``,
    `## 4. 却下・ノイズ除外（反映しなかった意見と理由）`,
    rejected.length + ignored.length === 0
      ? '該当なし。'
      : [...rejected, ...ignored]
          .map((r) => `- ~~${r.message}~~ — *${r.triage.reason}* (${r.triage.judgedBy})`)
          .join('\n'),
    ``,
  ];

  await fs.writeFile(REPORT_PATH, lines.join('\n') + '\n', 'utf8');
  console.log(lines.join('\n'));
}

main().catch((err) => {
  console.error('[Feedback Triage] Failed:', err);
  process.exit(1);
});
