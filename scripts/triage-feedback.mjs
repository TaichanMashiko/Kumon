#!/usr/bin/env node
/**
 * テストプレイヤー意見の3段階トリアージ＆ノイズ除外パイプライン
 *
 * 適当な投稿・スパム・教育方針に反する甘やかし要望をそのまま反映せず、
 * 以下の3段階で自動判定して logs/feedback-triage-report.md に記録します：
 *   Stage 1: ノイズ・無意味・短文・重複の自動除外 (ignored)
 *   Stage 2: 教育原則（90%合格基準・大学入試到達・スモールステップ）との整合性チェック (rejected)
 *   Stage 3: 具体性・事実検証・学習ログとのクロスチェックによる優先度判定 (adopted / pending_corroboration)
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const REPORT_PATH = path.join(LOGS_DIR, 'feedback-triage-report.md');

const LOW_SIGNAL_PATTERNS = [
  /^(ああ+|うう+|ええ+|おお+|ww+|草+|テスト|test|asdf|qwerty|なし|特になし|わからん|むずい|難しい|簡単|ひま|つかれた)[!！。.?？]*$/i,
];

const POLICY_CONFLICT_PATTERNS = [
  /(90%|90％|合格|基準).*(下げ|緩く|ゆるく|なくし|廃止|撤廃)/,
  /(答え|解答).*(最初から|常に|自動で).*(表示|見せて)/,
  /(ステップ|問題数).*(飛ばし|スキップ|減らし|1問だけ)/,
];

const HIGH_SIGNAL_BUG_PATTERNS = [
  /(ズレ|ずれ|誤字|誤植|間違い|まちがい|バグ|エラー|404|500|崩れ|表示されない|計算ミス|解説が違う|答えが違う|例題)/,
];

export function triageFeedbackItem(item, seenMessages, bottleneckStepIds) {
  const raw = String(item.message || '').trim();
  const compact = raw.replace(/\s+/g, '');

  // Stage 1: Noise / Spam / Duplicate filter
  if (compact.length < 10) {
    return { decision: 'ignored', reason: 'Stage 1（ノイズ除外）: 10文字未満で具体性が不足' };
  }
  if (/^(.)\1{4,}$/.test(compact) || new Set(compact).size <= 2) {
    return { decision: 'ignored', reason: 'Stage 1（ノイズ除外）: 同一文字の繰り返し・無意味入力' };
  }
  if (LOW_SIGNAL_PATTERNS.some((re) => re.test(compact))) {
    return { decision: 'ignored', reason: 'Stage 1（ノイズ除外）: 抽象的な感想・テスト投稿' };
  }
  const dedupeKey = `${item.stepId || ''}::${compact.toLowerCase()}`;
  if (seenMessages.has(dedupeKey)) {
    return { decision: 'ignored', reason: 'Stage 1（重複除外）: 同一内容の重複報告' };
  }
  seenMessages.add(dedupeKey);

  // Stage 2: Educational Policy Alignment Gate
  if (POLICY_CONFLICT_PATTERNS.some((re) => re.test(raw))) {
    return {
      decision: 'rejected',
      reason: 'Stage 2（方針不一致により却下）: 90%厳格合格・大学入試到達の原則に反する要望',
    };
  }

  // Stage 3: Evidence & Cross-check Prioritization
  const isBugReport =
    item.category === '問題のミス・解説のズレ' ||
    HIGH_SIGNAL_BUG_PATTERNS.some((re) => re.test(raw));
  const corroboratedByLog = Boolean(item.stepId && bottleneckStepIds.has(item.stepId));

  if (isBugReport) {
    return {
      decision: 'adopted',
      priority: 'HIGH',
      reason: 'Stage 3（採用・最優先検証）: 問題の誤り・解説ズレ・不具合の具体的指摘（コード照合対象）',
    };
  }
  if (corroboratedByLog) {
    return {
      decision: 'adopted',
      priority: 'MEDIUM',
      reason: 'Stage 3（採用・ログ裏付けあり）: 該当ステップの学習ログ（低正答率/低評価）と一致',
    };
  }
  return {
    decision: 'pending_corroboration',
    priority: 'LOW',
    reason: 'Stage 3（保留・複数証跡待ち）: 単発の主観的要望のため、複数名からの同様報告またはログ裏付けを確認後に採用判断',
  };
}

async function main() {
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

  const seen = new Set();
  const results = feedbackItems.map((item) => ({
    ...item,
    triage: triageFeedbackItem(item, seen, bottleneckStepIds),
  }));

  const adopted = results.filter((r) => r.triage.decision === 'adopted');
  const pending = results.filter((r) => r.triage.decision === 'pending_corroboration');
  const rejected = results.filter((r) => r.triage.decision === 'rejected');
  const ignored = results.filter((r) => r.triage.decision === 'ignored');

  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    `# テストプレイヤー意見 3段階トリアージレポート`,
    ``,
    `- 実行日: ${today}`,
    `- 総受信件数: **${results.length} 件**（採用: ${adopted.length} / 保留: ${pending.length} / 方針却下: ${rejected.length} / ノイズ除外: ${ignored.length}）`,
    ``,
    `## 1. 採用（修正・アップデート対象）`,
    adopted.length === 0
      ? '現在、新規の採用対象はありません。'
      : adopted
          .map(
            (r) =>
              `- **[${r.triage.priority}]** ${r.stepId ? `\`${r.stepId}\` ` : ''}${r.message} — *${r.triage.reason}*`
          )
          .join('\n'),
    ``,
    `## 2. 保留（複数報告・学習ログ裏付け待ち）`,
    pending.length === 0
      ? '現在、保留中の要望はありません。'
      : pending
          .map(
            (r) =>
              `- ${r.stepId ? `\`${r.stepId}\` ` : ''}${r.message} — *${r.triage.reason}*`
          )
          .join('\n'),
    ``,
    `## 3. 却下・ノイズ除外（反映しなかった意見と理由）`,
    rejected.length + ignored.length === 0
      ? '該当なし。'
      : [...rejected, ...ignored]
          .map((r) => `- ~~${r.message}~~ — *${r.triage.reason}*`)
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
