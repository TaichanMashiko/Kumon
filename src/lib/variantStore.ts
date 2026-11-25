import { MICRO_STEPS_BY_ID } from '../curriculum';
import { renderStepMarkdown } from '../curriculum/mathEngine';
import type { StepDocument, VariantProblemSet } from '../types/curriculum';
import { isFirebaseConfigured } from './firebase';
import {
  fetchSharedVariantFromFirestore,
  saveSharedVariantToFirestore,
} from './firestoreSync';

const VARIANT_POOL_KEY = 'mathstep_shared_variant_pool_v2';

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

export async function getOrGenerateVariantSet(
  step: StepDocument,
  variantNumber: number
): Promise<{
  variant: VariantProblemSet;
  source: 'firestore-cache' | 'local-cache' | 'generator' | 'gemini';
}> {
  const stepId = step.frontmatter.id;
  const questionCount = step.frontmatter.question_count ?? 15;

  // 1. Check Firestore shared pool first (shared across all students & devices)
  if (isFirebaseConfigured) {
    const remoteHit = await fetchSharedVariantFromFirestore(stepId, variantNumber);
    if (remoteHit) {
      upsertSharedVariant(remoteHit);
      return { variant: remoteHit, source: 'firestore-cache' };
    }
  }

  // 2. Check local shared pool
  const localPool = loadSharedVariantPool();
  const localHit = localPool.find(
    (v) => v.stepId === stepId && v.variantNumber === variantNumber
  );
  if (localHit) {
    if (isFirebaseConfigured) {
      void saveSharedVariantToFirestore(localHit);
    }
    return { variant: localHit, source: 'local-cache' };
  }

  // 3. Deterministic same-level, exact same-count mathematical generator (100% accurate, instant)
  const spec = MICRO_STEPS_BY_ID[stepId];
  if (spec) {
    const variant: VariantProblemSet = {
      id: `${stepId}-v${variantNumber}`,
      stepId,
      variantNumber,
      questionCount: spec.questionCount,
      markdown: renderStepMarkdown(spec, variantNumber),
      createdAt: new Date().toISOString(),
      createdBy: 'preset',
    };
    upsertSharedVariant(variant);
    if (isFirebaseConfigured) {
      void saveSharedVariantToFirestore(variant);
    }
    return { variant, source: 'generator' };
  }

  // 4. Fallback to Gemini API for custom non-catalog steps
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
      errData.error || `類題生成APIエラー (HTTP ${res.status})`
    );
  }

  const data = (await res.json()) as {
    variant: VariantProblemSet;
    reused: boolean;
  };

  upsertSharedVariant(data.variant);
  if (isFirebaseConfigured) {
    await saveSharedVariantToFirestore(data.variant);
  }

  return { variant: data.variant, source: 'gemini' };
}
