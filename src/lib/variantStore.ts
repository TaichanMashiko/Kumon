import type { StepDocument, VariantProblemSet } from '../types/curriculum';

const VARIANT_POOL_KEY = 'mathstep_shared_variant_pool_v1';

const PRESET_VARIANTS: VariantProblemSet[] = [
  {
    id: 'E-CALC-001-v1',
    stepId: 'E-CALC-001',
    variantNumber: 1,
    questionCount: 5,
    createdAt: '2026-11-25T00:00:00+09:00',
    createdBy: 'preset',
    markdown: `# ✍️ 類題トレーニング #1（全5問）

同じレベルの類題です。90%以上（5問中5問）を目指してノートに解きましょう！

1. $\\displaystyle \\frac{1}{3} + \\frac{1}{6}$
2. $\\displaystyle \\frac{1}{2} + \\frac{1}{5}$
3. $\\displaystyle \\frac{3}{4} - \\frac{1}{8}$
4. $\\displaystyle \\frac{4}{5} - \\frac{1}{2}$
5. $\\displaystyle \\frac{2}{3} + \\frac{3}{4}$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. $\\displaystyle \\frac{2}{6} + \\frac{1}{6} = \\frac{3}{6} = \\frac{1}{2}$
2. $\\displaystyle \\frac{5}{10} + \\frac{2}{10} = \\frac{7}{10}$
3. $\\displaystyle \\frac{6}{8} - \\frac{1}{8} = \\frac{5}{8}$
4. $\\displaystyle \\frac{8}{10} - \\frac{5}{10} = \\frac{3}{10}$
5. $\\displaystyle \\frac{8}{12} + \\frac{9}{12} = \\frac{17}{12}$

</details>`,
  },
  {
    id: 'M3-INT-012-v1',
    stepId: 'M3-INT-012',
    variantNumber: 1,
    questionCount: 4,
    createdAt: '2026-11-25T00:00:00+09:00',
    createdBy: 'preset',
    markdown: `# ✍️ 類題トレーニング #1（全4問）

同じレベルの類題です。90%以上（4問中4問）を目指してノートに解きましょう！（$C$ は積分定数）

1. $\\displaystyle \\int 2x(x^2 + 3)^4 \\, dx$
2. $\\displaystyle \\int 3x^2(x^3 + 1)^5 \\, dx$
3. $\\displaystyle \\int \\frac{2x}{x^2 + 5} \\, dx$
4. $\\displaystyle \\int \\cos^2 x \\sin x \\, dx$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. $t = x^2 + 3$ と置くと $dt = 2x\\,dx$ より、$\\displaystyle \\frac{1}{5}(x^2 + 3)^5 + C$
2. $t = x^3 + 1$ と置くと $dt = 3x^2\\,dx$ より、$\\displaystyle \\frac{1}{6}(x^3 + 1)^6 + C$
3. $t = x^2 + 5$ と置くと $dt = 2x\\,dx$ より、$\\log(x^2 + 5) + C$
4. $t = \\cos x$ と置くと $dt = -\\sin x\\,dx$ より、$\\displaystyle -\\frac{1}{3}\\cos^3 x + C$

</details>`,
  },
];

export function loadSharedVariantPool(): VariantProblemSet[] {
  try {
    const raw = localStorage.getItem(VARIANT_POOL_KEY);
    if (!raw) {
      localStorage.setItem(VARIANT_POOL_KEY, JSON.stringify(PRESET_VARIANTS));
      return [...PRESET_VARIANTS];
    }
    return JSON.parse(raw) as VariantProblemSet[];
  } catch {
    return [...PRESET_VARIANTS];
  }
}

export function saveSharedVariantPool(pool: VariantProblemSet[]): void {
  try {
    localStorage.setItem(VARIANT_POOL_KEY, JSON.stringify(pool));
  } catch {
    // Ignore storage errors
  }
}

export function upsertSharedVariant(variant: VariantProblemSet): VariantProblemSet[] {
  const pool = loadSharedVariantPool();
  const idx = pool.findIndex(
    (v) => v.stepId === variant.stepId && v.variantNumber === variant.variantNumber
  );
  if (idx >= 0) {
    pool[idx] = variant;
  } else {
    pool.push(variant);
  }
  saveSharedVariantPool(pool);
  return pool;
}

export async function getOrGenerateVariantSet(
  step: StepDocument,
  variantNumber: number
): Promise<{ variant: VariantProblemSet; source: 'local-cache' | 'server-cache' | 'gemini' }> {
  const stepId = step.frontmatter.id;
  const questionCount = step.frontmatter.question_count ?? 4;

  // 1. Check local shared pool first (zero API cost)
  const localPool = loadSharedVariantPool();
  const localHit = localPool.find(
    (v) => v.stepId === stepId && v.variantNumber === variantNumber
  );
  if (localHit) {
    return { variant: localHit, source: 'local-cache' };
  }

  // 2. Call Vercel Serverless API (checks server shared cache first, otherwise generates via Gemini & saves)
  const res = await fetch('/api/generate-variants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stepId,
      title: step.frontmatter.title,
      stage: step.frontmatter.stage,
      category: step.frontmatter.category,
      questionCount,
      variantNumber,
      originalMarkdown: step.body,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData.error || `類題生成APIの呼び出しに失敗しました (HTTP ${res.status})`
    );
  }

  const data = (await res.json()) as {
    variant: VariantProblemSet;
    reused: boolean;
  };

  upsertSharedVariant(data.variant);
  return {
    variant: data.variant,
    source: data.reused ? 'server-cache' : 'gemini',
  };
}
