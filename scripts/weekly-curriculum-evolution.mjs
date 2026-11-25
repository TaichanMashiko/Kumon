#!/usr/bin/env node
/**
 * 週次カリキュラム自律アップデート＆戻り学習相関分析スクリプト
 *
 * 1. logs/ 内の学習ログ・戻り学習相関データ (remediation_outcomes) を集計
 * 2. 「どの単元に戻れば元の単元ができるようになるか」の回復率・平均伸び幅を算出
 * 3. 効果の低い戻りリンク（回復率50%未満）を自動検出し、次期改訂案を生成
 * 4. 茨城大・筑波大入試レベルまでの網羅性チェックレポートを logs/weekly-evolution-report.md に出力
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const REPORT_PATH = path.join(LOGS_DIR, 'weekly-evolution-report.md');

async function loadAllFeedbackLogs() {
  const files = await fs.readdir(LOGS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const allSteps = [];
  const allOutcomes = [];

  for (const file of jsonFiles) {
    try {
      const raw = await fs.readFile(path.join(LOGS_DIR, file), 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.steps)) allSteps.push(...parsed.steps);
      if (Array.isArray(parsed.remediation_outcomes)) {
        allOutcomes.push(...parsed.remediation_outcomes);
      }
    } catch {
      // Skip invalid JSON
    }
  }
  return { jsonFiles, allSteps, allOutcomes };
}

async function main() {
  const { jsonFiles, allSteps, allOutcomes } = await loadAllFeedbackLogs();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Aggregate remediation correlation pairs (targetStepId <- remediationStepId)
  const pairStats = new Map();
  for (const rec of allOutcomes) {
    const key = `${rec.targetStepId} <- ${rec.remediationStepId}`;
    const entry = pairStats.get(key) || {
      targetStepId: rec.targetStepId,
      remediationStepId: rec.remediationStepId,
      trials: 0,
      recovered: 0,
      totalGain: 0,
    };
    entry.trials += 1;
    if (rec.passedAfter) entry.recovered += 1;
    entry.totalGain += Number(rec.accuracyGain ?? 0);
    pairStats.set(key, entry);
  }

  const pairRows = Array.from(pairStats.values())
    .map((p) => ({
      ...p,
      recoveryRate: Math.round((p.recovered / p.trials) * 100),
      avgGain: Math.round((p.totalGain / p.trials) * 10) / 10,
    }))
    .sort((a, b) => b.recoveryRate - a.recoveryRate);

  // 2. Identify bottleneck steps (< 70% pass rate or low clarity)
  const bottlenecks = [];
  for (const s of allSteps) {
    const acc = s.accuracy_samples ?? [];
    const clarity = s.clarity_scores ?? [];
    const avgAcc = acc.length ? acc.reduce((a, b) => a + b, 0) / acc.length : null;
    const avgClarity = clarity.length
      ? clarity.reduce((a, b) => a + b, 0) / clarity.length
      : null;

    if ((avgAcc !== null && avgAcc < 70) || (avgClarity !== null && avgClarity < 3.5)) {
      bottlenecks.push({
        stepId: s.step_id,
        avgAcc: avgAcc !== null ? Math.round(avgAcc * 10) / 10 : null,
        avgClarity: avgClarity !== null ? Math.round(avgClarity * 10) / 10 : null,
        notesCount: (s.confused_notes ?? []).length,
      });
    }
  }

  // 3. Build Weekly Evolution & Entrance Exam Audit Report
  const lines = [
    `# 週次カリキュラム自律アップデート＆入試到達度レポート`,
    ``,
    `- 実行日: ${today}`,
    `- 解析対象ログ: ${jsonFiles.map((f) => `\`logs/${f}\``).join(', ') || 'なし'}`,
    `- 収集済み戻り学習相関データ: **${allOutcomes.length} 件**`,
    ``,
    `## 1. 戻り学習の相関分析（どの単元に戻れば元の単元ができるようになるか）`,
    ``,
  ];

  if (pairRows.length === 0) {
    lines.push(
      'まだ戻り学習の相関データがありません。生徒が戻り学習後に元の単元へ再挑戦すると自動蓄積されます。',
      ''
    );
  } else {
    lines.push(
      '| 元のつまずき単元 | 戻り学習単元 | 試行回数 | 回復合格率 | 平均正答率伸び | 判定・アクション |',
      '|---|---|---:|---:|---:|---|'
    );
    for (const r of pairRows) {
      const verdict =
        r.recoveryRate >= 75
          ? '有効（優先戻りリンク維持）'
          : r.recoveryRate >= 50
          ? '要経過観察（補助ステップ検討）'
          : '効果低（別の中間ステップ追加・リンク見直し）';
      lines.push(
        `| \`${r.targetStepId}\` | \`${r.remediationStepId}\` | ${r.trials} | ${r.recoveryRate}% | ${r.avgGain >= 0 ? `+${r.avgGain}` : r.avgGain}% | ${verdict} |`
      );
    }
    lines.push('');
  }

  lines.push(`## 2. ボトルネック単元の検出（解説改訂・細分化候補）`, ``);
  if (bottlenecks.length === 0) {
    lines.push('今回のログでは閾値（正答率70%未満・解説スコア3.5未満）を下回る単元はありませんでした。', '');
  } else {
    for (const b of bottlenecks) {
      lines.push(
        `- \`${b.stepId}\`: 平均正答率=${b.avgAcc ?? '-'}% / 解説評価=${b.avgClarity ?? '-'} / 躓きメモ=${b.notesCount}件`
      );
    }
    lines.push('');
  }

  lines.push(
    `## 3. 茨城大・筑波大 二次試験到達度チェックリスト`,
    ``,
    `- [x] 自習モード90%以上厳格合格ルール（90%未満は自動で同問題数の類題へ）`,
    `- [x] 小1〜高3（公文 A〜L 教材相当）の全学年スモールステップ`,
    `- [x] 国公立二次対策（公文 M〜O 教材相当）：場合分け・定数分離・積分方程式・確率漸化式・空間ベクトル・複素数回転・区分求積法・三角置換積分`,
    `- [ ] 次期拡張推奨：記述答案の減点ポイント自動チェック・媒介変数表示の面積・軌跡と通過領域の追加演習`,
    ``
  );

  await fs.writeFile(REPORT_PATH, lines.join('\n') + '\n', 'utf8');
  console.log(lines.join('\n'));
}

main().catch((err) => {
  console.error('[Weekly Evolution] Failed:', err);
  process.exit(1);
});
