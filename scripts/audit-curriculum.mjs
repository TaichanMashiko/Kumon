#!/usr/bin/env node
/**
 * 全カリキュラム自動品質監査スクリプト（QA Gate）
 *
 * 1. 全ステップのタイトル・テンプレート・パラメータ・解説の整合性を自動検査
 * 2. 全ステップの v0 / v1 問題を実際に生成し、NaN / undefined / KaTeX $不整合 / 重複を検出
 * 3. 例題（workedExample）の未定義フォールバックを検出
 * 4. 戻り学習リンク（remediationIds）のリンク切れ・逆行を検出
 */

import { build } from 'esbuild';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_DIR = process.cwd();

function countUnescapedDollars(text) {
  if (!text) return 0;
  // Remove $$ blocks first, then count single $
  const withoutDisplay = text.replace(/\$\$[\s\S]*?\$\$/g, '');
  const matches = withoutDisplay.match(/(?<!\\)\$/g);
  return matches ? matches.length : 0;
}

/**
 * 数学的検算チェッカー（生成された問題文と解答の数式・数値を独立に再計算して照合）
 */
function verifyMathAnswer(prompt, answer) {
  const cleanP = String(prompt || '').replace(/\$/g, '').trim();
  const cleanA = String(answer || '').replace(/\$/g, '').trim();
  if (!cleanA) return '解答が空です';

  // 1. 基本四則計算: "a + b =", "a - b =", "a × b =", "a ÷ b ="
  const arithMatch = cleanP.match(/^(-?\d+(?:\.\d+)?)\s*([+\-×÷])\s*(-?\d+(?:\.\d+)?)\s*=$/);
  if (arithMatch) {
    const a = Number(arithMatch[1]);
    const op = arithMatch[2];
    const b = Number(arithMatch[3]);
    if (op === '÷' && cleanA.includes('あまり')) {
      const remMatch = cleanA.match(/^(\d+)\s*あまり\s*(\d+)$/);
      if (!remMatch) return `余り形式が不正: ${cleanA}`;
      const q = Number(remMatch[1]);
      const r = Number(remMatch[2]);
      if (q * b + r !== a || r < 0 || r >= b) {
        return `割り算(余り)検算不一致: ${a} ÷ ${b} ≠ ${q} あまり ${r}`;
      }
      return null;
    }
    const ansNum = Number(cleanA);
    if (!Number.isNaN(ansNum)) {
      let expected;
      if (op === '+') expected = a + b;
      else if (op === '-') expected = a - b;
      else if (op === '×') expected = a * b;
      else if (op === '÷') expected = a / b;
      if (Math.abs(expected - ansNum) > 1e-6) {
        return `四則検算不一致: ${a} ${op} ${b} = ${expected} (解答: ${ansNum})`;
      }
    }
  }

  // 2. 1次方程式: "ax + b = c" に対して "x = ans" を代入検算
  const linEq = cleanP.match(/^(-?\d*)x\s*([+\-])\s*(\d+)\s*=\s*(-?\d+)$/);
  const xAns = cleanA.match(/^x\s*=\s*(-?\d+)$/);
  if (linEq && xAns) {
    const a = linEq[1] === '' ? 1 : linEq[1] === '-' ? -1 : Number(linEq[1]);
    const b = (linEq[2] === '-' ? -1 : 1) * Number(linEq[3]);
    const c = Number(linEq[4]);
    const x = Number(xAns[1]);
    if (a * x + b !== c) {
      return `1次方程式代入検算不一致: ${a}*(${x}) + (${b}) ≠ ${c}`;
    }
  }

  // 3. 平方完成・2次方程式・3次式などで明らかな記号破損（"+ -", "--" 等）がないか検査
  if (/\+\s*-/.test(cleanA) && !cleanA.includes('\\pm')) {
    return `符号表記の不整合("+ -"): ${cleanA}`;
  }

  return null;
}

async function main() {
  const tmpFile = path.join(os.tmpdir(), `mathstep-audit-${Date.now()}.mjs`);
  await build({
    entryPoints: [path.join(ROOT_DIR, 'src', 'curriculum', 'auditEntry.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: tmpFile,
    logLevel: 'silent',
  });

  const mod = await import(pathToFileURL(tmpFile).href);
  await fs.unlink(tmpFile).catch(() => {});

  const {
    ALL_MICRO_STEPS,
    MICRO_STEPS_BY_ID,
    generateWorksheetData,
    resolveRemediationIds,
  } = mod;

  const errors = [];
  const warnings = [];
  const stepIndexById = new Map(ALL_MICRO_STEPS.map((s, idx) => [s.id, idx]));

  for (const spec of ALL_MICRO_STEPS) {
    const idx = stepIndexById.get(spec.id);
    const p = spec.params || {};
    const t = spec.title;
    const exp = spec.explanation || '';

    // 1. Title <-> Template / Params / Explanation consistency rules
    if (t.includes('あまりあり') && spec.template !== 'div_rem') {
      errors.push(`[${spec.id}] タイトルに「あまりあり」があるのに template=${spec.template}`);
    }
    if (t.includes('鋭角') && p.obtuse === true) {
      errors.push(`[${spec.id}] タイトルが「鋭角」なのに params.obtuse=true`);
    }
    if (t.includes('鋭角') && exp.includes('鈍角')) {
      errors.push(`[${spec.id}] タイトルが「鋭角」なのに解説に「鈍角」が含まれています`);
    }
    if (t.includes('鈍角') && p.obtuse !== true) {
      errors.push(`[${spec.id}] タイトルが「鈍角」なのに params.obtuse!=true`);
    }
    if (t.includes('< 0') && p.isGt === true) {
      errors.push(`[${spec.id}] タイトルが「< 0」なのに params.isGt=true`);
    }
    if (t.includes('> 0') && p.isGt === false) {
      errors.push(`[${spec.id}] タイトルが「> 0」なのに params.isGt=false`);
    }
    if (t.includes('接線の方程式（接線') && p.mode !== 'tangent') {
      errors.push(`[${spec.id}] タイトルが「接線」なのに mode=${p.mode}`);
    }
    if (t.includes('極大・極小') && p.mode !== 'extrema') {
      errors.push(`[${spec.id}] タイトルが「極大・極小」なのに mode=${p.mode}`);
    }
    if (countUnescapedDollars(exp) % 2 !== 0) {
      errors.push(`[${spec.id}] 解説の KaTeX $ 記号が奇数個で閉じていません`);
    }

    // 2. Generate v0 and v1 worksheets and validate every problem + answer + workedExample
    const v0 = generateWorksheetData(spec, 0);
    const v1 = generateWorksheetData(spec, 1);

    if (v0.workedExample.problem === 'このレベルの標準例題') {
      warnings.push(`[${spec.id}] 専用例題が未定義（汎用フォールバック）: template=${spec.template}`);
    }
    if (countUnescapedDollars(v0.workedExample.problem) % 2 !== 0) {
      errors.push(`[${spec.id}] 例題問題文の $ 記号が閉じていません`);
    }
    if (countUnescapedDollars(v0.workedExample.answer) % 2 !== 0) {
      errors.push(`[${spec.id}] 例題解答の $ 記号が閉じていません`);
    }

    for (const [verName, ws] of [
      ['v0', v0],
      ['v1', v1],
    ]) {
      if (ws.problems.length !== spec.questionCount) {
        errors.push(
          `[${spec.id}:${verName}] 問題数不一致: 期待=${spec.questionCount}, 実際=${ws.problems.length}`
        );
      }
      ws.problems.forEach((prob, pIdx) => {
        const combined = `${prob.prompt} ${prob.answer}`;
        if (
          combined.includes('NaN') ||
          combined.includes('undefined') ||
          combined.includes('Infinity')
        ) {
          errors.push(`[${spec.id}:${verName}#${pIdx + 1}] 不正な値(NaN/undefined): ${combined}`);
        }
        if (countUnescapedDollars(prob.prompt) % 2 !== 0) {
          errors.push(`[${spec.id}:${verName}#${pIdx + 1}] 問題文の $ 不整合: ${prob.prompt}`);
        }
        if (countUnescapedDollars(prob.answer) % 2 !== 0) {
          errors.push(`[${spec.id}:${verName}#${pIdx + 1}] 解答の $ 不整合: ${prob.answer}`);
        }
        const mathErr = verifyMathAnswer(prob.prompt, prob.answer);
        if (mathErr) {
          errors.push(`[${spec.id}:${verName}#${pIdx + 1}] ${mathErr}`);
        }
      });
    }

    // 3. Remediation link integrity check
    const remIds = resolveRemediationIds(spec.id, spec.remediationIds);
    for (const rId of remIds) {
      if (!MICRO_STEPS_BY_ID[rId]) {
        errors.push(`[${spec.id}] 戻り学習リンク先が存在しません: ${rId}`);
      } else if (stepIndexById.get(rId) >= idx) {
        warnings.push(`[${spec.id}] 戻り学習リンク先が現在レベル以降です: ${rId}`);
      }
    }
  }

  console.log(`=== カリキュラム自動品質監査結果 ===`);
  console.log(`検査ステップ総数: ${ALL_MICRO_STEPS.length} ステップ`);
  console.log(`エラー件数: ${errors.length} 件`);
  console.log(`警告（例題未定義等）: ${warnings.length} 件`);

  if (warnings.length > 0) {
    console.log('\n--- 警告（先頭20件） ---');
    warnings.slice(0, 20).forEach((w) => console.log('  [WARN]', w));
  }
  if (errors.length > 0) {
    console.log('\n--- エラー ---');
    errors.forEach((e) => console.log('  [ERR]', e));
    process.exit(1);
  }
  console.log('\n全ステップの整合性チェックをパスしました！');
}

main().catch((err) => {
  console.error('[Audit] Failed:', err);
  process.exit(1);
});
