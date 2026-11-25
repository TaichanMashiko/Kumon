import { MICRO_STEPS_BY_ID } from '../curriculum';
import { generateWorksheetData, renderStepMarkdown } from '../curriculum/mathEngine';
import type { StepDocument, VariantProblemSet } from '../types/curriculum';
import { isFirebaseConfigured } from './firebase';
import {
  fetchSharedVariantFromFirestore,
  saveSharedVariantToFirestore,
} from './firestoreSync';

const VARIANT_POOL_KEY = 'mathstep_shared_variant_pool_v3';

export const PRESET_VARIANTS: VariantProblemSet[] = [];

export function loadSharedVariantPool(): VariantProblemSet[] {
  try {
    const raw = localStorage.getItem(VARIANT_POOL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VariantProblemSet[];
  } catch {
    return [];
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

function shouldUseGeminiForVariants(stage: string): boolean {
  return stage.startsWith('高校') || stage.startsWith('大学入試');
}

export async function getOrGenerateVariantSet(
  step: StepDocument,
  variantNumber: number
): Promise<{
  variant: VariantProblemSet;
  source: 'firestore-cache' | 'local-cache' | 'generator' | 'gemini';
}> {
  const stepId = step.frontmatter.id;
  const spec = MICRO_STEPS_BY_ID[stepId];
  const questionCount = spec?.questionCount ?? step.frontmatter.question_count ?? 10;

  // 1. Check Firestore shared pool first (shared across ALL students & devices -> APIコストゼロ)
  if (isFirebaseConfigured) {
    const remoteHit = await fetchSharedVariantFromFirestore(stepId, variantNumber);
    if (remoteHit && remoteHit.problems && remoteHit.problems.length > 0) {
      upsertSharedVariant(remoteHit);
      return { variant: remoteHit, source: 'firestore-cache' };
    }
  }

  // 2. Check local shared cache
  const localPool = loadSharedVariantPool();
  const localHit = localPool.find(
    (v) =>
      v.stepId === stepId &&
      v.variantNumber === variantNumber &&
      Array.isArray(v.problems) &&
      v.problems.length > 0
  );
  if (localHit) {
    if (isFirebaseConfigured) {
      void saveSharedVariantToFirestore(localHit);
    }
    return { variant: localHit, source: 'local-cache' };
  }

  // 3. 高校・大学入試レベルは Gemini API で「真の類題」を生成し、Firestore へ保存して全生徒で再利用！
  if (shouldUseGeminiForVariants(step.frontmatter.stage)) {
    try {
      const originalData = spec ? generateWorksheetData(spec, 0) : null;
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
          originalProblems: originalData?.problems ?? [],
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          variant: VariantProblemSet;
          reused: boolean;
        };
        if (data.variant?.problems && data.variant.problems.length > 0) {
          upsertSharedVariant(data.variant);
          if (isFirebaseConfigured) {
            await saveSharedVariantToFirestore(data.variant);
          }
          return { variant: data.variant, source: 'gemini' };
        }
      }
    } catch {
      // Fallback gracefully to zero-overlap deterministic generator below
    }
  }

  // 4. 小中計算ドリル（重複排除＋虫食い/文章題構造変化）＆フォールバック
  if (spec) {
    const generated = generateWorksheetData(spec, variantNumber);
    const variant: VariantProblemSet = {
      id: `${stepId}-v${variantNumber}`,
      stepId,
      variantNumber,
      questionCount: generated.questionCount,
      markdown: renderStepMarkdown(spec, variantNumber),
      problems: generated.problems,
      createdAt: new Date().toISOString(),
      createdBy: 'preset',
    };
    upsertSharedVariant(variant);
    if (isFirebaseConfigured) {
      void saveSharedVariantToFirestore(variant);
    }
    return { variant, source: 'generator' };
  }

  throw new Error('類題の生成に失敗しました。');
}
