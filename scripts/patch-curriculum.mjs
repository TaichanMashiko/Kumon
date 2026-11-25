#!/usr/bin/env node
/**
 * Antigravity 自律進化型 定期パッチスクリプト
 *
 * ルール1 (解説リライト):
 *   clarity_score < 3.5 または confused_notes が2件以上
 *   -> 躓きメモへのQ&A補足、途中計算のKaTeX展開、インラインSVG図解を追記し version をインクリメント
 *
 * ルール2 (ステップ細分化 / 補助ステップ動的挿入):
 *   pass_rate_avg < 70%
 *   -> 前ステップとの落差を埋める補助ステップ (例: M3-INT-011b) を新規生成し curriculum-map.json に自動挿入
 *
 * 使い方:
 *   node scripts/patch-curriculum.mjs [--log logs/feedback-sample.json] [--ref-dir <path>] [--dry-run]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT_DIR = process.cwd();
const CURRICULUM_MAP_PATH = path.join(ROOT_DIR, 'content', 'curriculum-map.json');
const REPORT_PATH = path.join(ROOT_DIR, 'logs', 'patch-report.md');

function parseArgs(argv) {
  const args = {
    logPath: path.join(ROOT_DIR, 'logs', 'feedback-sample.json'),
    refDir: null,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--dry-run') {
      args.dryRun = true;
    } else if (token === '--log' && argv[i + 1]) {
      args.logPath = path.resolve(ROOT_DIR, argv[i + 1]);
      i += 1;
    } else if (token === '--ref-dir' && argv[i + 1]) {
      args.refDir = path.resolve(ROOT_DIR, argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('YAML frontmatter not found');
  }
  return {
    frontmatter: yaml.load(match[1]),
    body: match[2].trim(),
  };
}

function serializeMarkdown(frontmatter, body) {
  const yamlText = yaml.dump(frontmatter, {
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
  });
  return `---\n${yamlText.trim()}\n---\n\n${body.trim()}\n`;
}

function average(nums) {
  if (!nums.length) return null;
  return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildRewriteSupplement(frontmatter, confusedNotes) {
  const qaItems = confusedNotes
    .map((note, idx) => {
      if (note.includes('dx') || note.includes('dt')) {
        return [
          `#### Q${idx + 1}. 「${note}」`,
          `- **ポイント**: $t = g(x)$ を $x$ で微分した式 $\\dfrac{dt}{dx} = g'(x)$ は、置換積分では分数のように扱って **$dt = g'(x)\\,dx$**（または $dx = \\dfrac{1}{g'(x)}\\,dt$）と書き換えてOKです。`,
          `- **途中計算の例**: $t = x^2 + 1$ なら $\\dfrac{dt}{dx} = 2x$ なので、両辺に $dx$ を掛けるイメージで $dt = 2x\\,dx$ となります。`,
        ].join('\n');
      }
      if (note.includes('2x') || note.includes('外にない') || note.includes('係数')) {
        return [
          `#### Q${idx + 1}. 「${note}」`,
          `- **ポイント**: 係数が足りないときは、定数倍で調整します。たとえば $\\displaystyle \\int x(x^2+1)^3\\,dx$ で $2x$ が欲しいときは、$dt = 2x\\,dx \\iff x\\,dx = \\dfrac{1}{2}\\,dt$ として $\\dfrac{1}{2}$ を積分の外に出します。`,
        ].join('\n');
      }
      return [
        `#### Q${idx + 1}. 「${note}」`,
        `- **補足**: 変数を $x$ から $t$ へ移すときは「① 式の本体」「② $dx$ の部分」の2か所をすべて $t$ に書き換えるのが鉄則です。`,
      ].join('\n');
    })
    .join('\n\n');

  return `
<!-- ANTIGRAVITY-PATCH-START:v${frontmatter.version + 1} -->
## 🔍 よくあるつまずき補足（定期パッチ自動改訂 v${frontmatter.version + 1}）

生徒の学習ログ（解説スコア: **${frontmatter.stats.clarity_score}**、躓きメモ: **${confusedNotes.length}件**）をもとに、途中計算と変換イメージを補強しました。

${qaItems}

### 途中計算のフル展開（$\\displaystyle \\int 2x(x^2 + 1)^3 \\, dx$）
$$
\\begin{aligned}
t &= x^2 + 1 \\quad \\text{と置くと} \\\\
\\frac{dt}{dx} &= 2x \\implies dt = 2x \\, dx \\\\
\\int (x^2 + 1)^3 \\cdot \\underbrace{2x \\, dx}_{dt} &= \\int t^3 \\, dt = \\frac{1}{4}t^4 + C = \\frac{1}{4}(x^2 + 1)^4 + C
\\end{aligned}
$$

<svg width="440" height="130" viewBox="0 0 440 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="dxからdtへの変換とペアの対応図">
  <rect x="14" y="18" width="185" height="94" rx="10" fill="#fff7ed" stroke="#ea580c" stroke-width="2" />
  <text x="106" y="42" text-anchor="middle" font-size="12" font-weight="700" fill="#9a3412">元の x の積分</text>
  <text x="106" y="68" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">∫ (x²+1)³ · (2x dx)</text>
  <text x="106" y="94" text-anchor="middle" font-size="11" fill="#c2410c">塊 t と 微分ペア 2x dx</text>
  <path d="M 206 65 L 246 65" stroke="#ea580c" stroke-width="2.5" marker-end="url(#arrPatch)" />
  <text x="226" y="53" text-anchor="middle" font-size="11" font-weight="700" fill="#9a3412">変換</text>
  <rect x="254" y="18" width="172" height="94" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
  <text x="340" y="42" text-anchor="middle" font-size="12" font-weight="700" fill="#1e3a8a">t だけの積分</text>
  <text x="340" y="68" text-anchor="middle" font-size="15" font-weight="700" fill="#1d4ed8">∫ t³ dt</text>
  <text x="340" y="94" text-anchor="middle" font-size="11" fill="#1e40af">2x dx が丸ごと dt に変化</text>
  <defs>
    <marker id="arrPatch" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
    </marker>
  </defs>
</svg>
<!-- ANTIGRAVITY-PATCH-END -->
`.trim();
}

function buildAuxiliaryStepId(prevStepId, currentStepId) {
  if (prevStepId) {
    return `${prevStepId}b`;
  }
  return `${currentStepId}-prep`;
}

function buildAuxiliaryFilePath(unitId, auxStepId) {
  const suffix = auxStepId.split('-').pop().toLowerCase();
  return `content/units/${unitId}/step-${suffix}.md`;
}

function buildAuxiliaryStepContent(auxId, unit, prevStepId, targetNode, targetFrontmatter) {
  const orderValue = round1(targetNode.order - 0.5);
  const frontmatter = {
    id: auxId,
    title: `【補助ステップ】dx と dt の書き換え集中トレーニング`,
    stage: targetFrontmatter.stage || unit.stage,
    category: targetFrontmatter.category || unit.category,
    order: orderValue,
    prerequisites: prevStepId ? [prevStepId] : [],
    stats: {
      total_attempts: 0,
      pass_rate_avg: 0,
      clarity_score: 5.0,
      confused_notes: [],
    },
    version: 1,
    last_updated: todayIsoDate(),
  };

  const body = `# 📖 解説（補助スモールステップ）

> 本ステップは、次のステップ **${targetNode.id}「${targetNode.title}」** の平均正答率が 70% を下回ったため、落差を埋めるために定期パッチで自動挿入されました。

置換積分で最もつまずきやすいのは、**積分計算そのものではなく「$dx$ を $dt$ に書き換える瞬間」**です。
このステップでは積分を実行せず、**「$t$ と置いて $dt = g'(x)\\,dx$ を作る」練習だけ**に集中しましょう。

### 3秒ルール（書き換えテンプレート）
1. $t = g(x)$ と書く
2. 右辺を $x$ で微分して $\\dfrac{dt}{dx} = g'(x)$ と書く
3. 両辺に $dx$ を掛けて **$dt = g'(x)\\,dx$** にする（係数が邪魔なら割る）

$$ t = x^2 + 1 \\implies \\frac{dt}{dx} = 2x \\implies dt = 2x\\,dx \\quad \\left(\\text{また } x\\,dx = \\frac{1}{2}\\,dt\\right) $$

<svg width="420" height="105" viewBox="0 0 420 105" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="dxからdt書き換えの3ステップ">
  <rect x="12" y="22" width="114" height="60" rx="8" fill="#f0f9ff" stroke="#0284c7" stroke-width="2" />
  <text x="69" y="47" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1">① 置く</text>
  <text x="69" y="68" text-anchor="middle" font-size="12" fill="#0f172a">t = x² + 1</text>
  <path d="M 130 52 L 150 52" stroke="#64748b" stroke-width="2" marker-end="url(#arrAux)" />
  <rect x="154" y="22" width="114" height="60" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-width="2" />
  <text x="211" y="47" text-anchor="middle" font-size="12" font-weight="700" fill="#854d0e">② 微分する</text>
  <text x="211" y="68" text-anchor="middle" font-size="12" fill="#0f172a">dt/dx = 2x</text>
  <path d="M 272 52 L 292 52" stroke="#64748b" stroke-width="2" marker-end="url(#arrAux)" />
  <rect x="296" y="22" width="112" height="60" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
  <text x="352" y="47" text-anchor="middle" font-size="12" font-weight="700" fill="#166534">③ 書き換え</text>
  <text x="352" y="68" text-anchor="middle" font-size="12" fill="#0f172a">dt = 2x dx</text>
  <defs>
    <marker id="arrAux" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
  </defs>
</svg>

# ✍️ 練習問題

次の置換について、ノートに **$dt = \\dots \\, dx$** および **$dx = \\dots \\, dt$** の形を書き出しましょう。

1. $t = 3x + 2$
2. $t = x^2 + 5$
3. $t = x^3 - 1$
4. $t = \\sin x$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. $dt = 3\\,dx$、$dx = \\dfrac{1}{3}\\,dt$
2. $dt = 2x\\,dx$、$x\\,dx = \\dfrac{1}{2}\\,dt$
3. $dt = 3x^2\\,dx$、$x^2\\,dx = \\dfrac{1}{3}\\,dt$
4. $dt = \\cos x\\,dx$

</details>
`;

  return serializeMarkdown(frontmatter, body);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`[MathStep Patch] Reading feedback log: ${args.logPath}`);
  if (args.dryRun) {
    console.log('[MathStep Patch] Running in DRY-RUN mode (no files will be written).');
  }
  if (args.refDir) {
    console.log(`[MathStep Patch] Reference material directory configured: ${args.refDir}`);
  }

  const [mapRaw, logRaw] = await Promise.all([
    fs.readFile(CURRICULUM_MAP_PATH, 'utf8'),
    fs.readFile(args.logPath, 'utf8'),
  ]);

  const curriculumMap = JSON.parse(mapRaw);
  const feedbackLog = JSON.parse(logRaw);

  const feedbackByStep = new Map();
  for (const entry of feedbackLog.steps ?? []) {
    feedbackByStep.set(entry.step_id, entry);
  }

  const reportLines = [
    `# Antigravity 定期パッチ実行レポート`,
    ``,
    `- 実行日: ${todayIsoDate()}`,
    `- 入力ログ: \`${path.relative(ROOT_DIR, args.logPath)}\``,
    `- モード: ${args.dryRun ? 'Dry Run（変更プレビュー）' : '本番適用'}`,
    ...(args.refDir ? [`- 参照教材ディレクトリ: \`${args.refDir}\``] : []),
    ``,
    `## 変更サマリー`,
    ``,
  ];

  let mapModified = false;
  let totalRewrites = 0;
  let totalAuxCreated = 0;

  for (const unit of curriculumMap.units) {
    const originalSteps = [...unit.steps];
    for (const node of originalSteps) {
      const logEntry = feedbackByStep.get(node.id);
      if (!logEntry) continue;

      const stepAbsPath = path.join(ROOT_DIR, node.file);
      const mdRaw = await fs.readFile(stepAbsPath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(mdRaw);

      // 1. Merge stats from feedback log
      const prevAttempts = Number(frontmatter.stats?.total_attempts ?? 0);
      const newAttempts = Number(logEntry.new_attempts ?? 0);
      const mergedAttempts = prevAttempts + newAttempts;

      const newAccAvg = average(logEntry.accuracy_samples ?? []);
      const mergedPassRate =
        newAccAvg !== null && mergedAttempts > 0
          ? round1(
              (Number(frontmatter.stats?.pass_rate_avg ?? newAccAvg) * prevAttempts +
                newAccAvg * newAttempts) /
                mergedAttempts
            )
          : Number(frontmatter.stats?.pass_rate_avg ?? 0);

      const newClarityAvg = average(logEntry.clarity_scores ?? []);
      const mergedClarity =
        newClarityAvg !== null
          ? round1(
              (Number(frontmatter.stats?.clarity_score ?? newClarityAvg) + newClarityAvg) / 2
            )
          : Number(frontmatter.stats?.clarity_score ?? 5.0);

      const existingNotes = Array.isArray(frontmatter.stats?.confused_notes)
        ? frontmatter.stats.confused_notes
        : [];
      const mergedNotes = Array.from(
        new Set([...existingNotes, ...(logEntry.confused_notes ?? [])])
      );

      frontmatter.stats = {
        total_attempts: mergedAttempts,
        pass_rate_avg: mergedPassRate,
        clarity_score: mergedClarity,
        confused_notes: mergedNotes,
      };

      let updatedBody = body;
      let stepFileChanged = true;

      // 2. Rule 1: Explanation Rewrite
      const needsRewrite = mergedClarity < 3.5 || mergedNotes.length >= 2;
      const alreadyPatched = updatedBody.includes('ANTIGRAVITY-PATCH-START');

      if (needsRewrite && !alreadyPatched) {
        const supplement = buildRewriteSupplement(frontmatter, mergedNotes);
        const practiceIdx = updatedBody.indexOf('# ✍️ 練習問題');
        if (practiceIdx !== -1) {
          updatedBody =
            updatedBody.slice(0, practiceIdx).trimEnd() +
            '\n\n' +
            supplement +
            '\n\n' +
            updatedBody.slice(practiceIdx);
        } else {
          updatedBody = `${updatedBody}\n\n${supplement}`;
        }
        frontmatter.version = Number(frontmatter.version ?? 1) + 1;
        frontmatter.last_updated = todayIsoDate();
        totalRewrites += 1;
        reportLines.push(
          `- **[解説リライト]** \`${node.id}\` (${node.title}): clarity_score=${mergedClarity}, confused_notes=${mergedNotes.length}件 -> 補足Q&A・途中計算KaTeX・SVG図解を追記し **v${frontmatter.version}** へ更新。`
        );
      }

      // 3. Rule 2: Step Subdivision (Auxiliary Step Insertion)
      const needsSubdivision = mergedPassRate > 0 && mergedPassRate < 70;
      const prevStepId = node.prerequisites?.[0] ?? null;
      const auxStepId = buildAuxiliaryStepId(prevStepId, node.id);
      const auxExists = unit.steps.some((s) => s.id === auxStepId);

      if (needsSubdivision && !auxExists) {
        const auxRelPath = buildAuxiliaryFilePath(unit.unit_id, auxStepId);
        const auxAbsPath = path.join(ROOT_DIR, auxRelPath);
        const auxContent = buildAuxiliaryStepContent(
          auxStepId,
          unit,
          prevStepId,
          node,
          frontmatter
        );

        const auxNode = {
          id: auxStepId,
          title: '【補助ステップ】dx と dt の書き換え集中トレーニング',
          order: round1(node.order - 0.5),
          prerequisites: prevStepId ? [prevStepId] : [],
          file: auxRelPath,
          is_auxiliary: true,
        };

        // Insert auxiliary step right before bottleneck node and rewire prerequisites
        const insertIndex = unit.steps.findIndex((s) => s.id === node.id);
        unit.steps.splice(insertIndex, 0, auxNode);
        node.prerequisites = [auxStepId];
        frontmatter.prerequisites = [auxStepId];
        mapModified = true;
        totalAuxCreated += 1;

        if (!args.dryRun) {
          await fs.writeFile(auxAbsPath, auxContent, 'utf8');
        }

        reportLines.push(
          `- **[ステップ細分化]** \`${node.id}\` (pass_rate_avg=${mergedPassRate}% < 70%) -> 補助ステップ \`${auxStepId}\` (\`${auxRelPath}\`) を新規生成し、\`curriculum-map.json\` の前提条件を自動接続。`
        );
      }

      if (stepFileChanged && !args.dryRun) {
        await fs.writeFile(stepAbsPath, serializeMarkdown(frontmatter, updatedBody), 'utf8');
      }
    }
  }

  if (mapModified) {
    curriculumMap.version = Number(curriculumMap.version ?? 1) + 1;
    curriculumMap.last_updated = todayIsoDate();
    if (!args.dryRun) {
      await fs.writeFile(
        CURRICULUM_MAP_PATH,
        JSON.stringify(curriculumMap, null, 2) + '\n',
        'utf8'
      );
    }
  }

  if (totalRewrites === 0 && totalAuxCreated === 0) {
    reportLines.push('- 今回のログではリライト・細分化の閾値を超えるステップはありませんでした（統計値のみ同期）。');
  }

  const reportContent = reportLines.join('\n') + '\n';
  if (!args.dryRun) {
    await fs.writeFile(REPORT_PATH, reportContent, 'utf8');
  }

  console.log('\n' + reportContent);
  console.log(
    `[MathStep Patch] Completed: ${totalRewrites} rewrite(s), ${totalAuxCreated} auxiliary step(s) created.`
  );
}

main().catch((err) => {
  console.error('[MathStep Patch] Failed:', err);
  process.exit(1);
});
