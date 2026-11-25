import {
  ALL_MICRO_STEPS,
  MICRO_STEPS_BY_ID,
  MICRO_STEPS_BY_STAGE,
  STAGE_GROUPS,
} from '../curriculum';
import {
  generateWorksheetData,
  renderStepMarkdown,
  type GeneratedWorksheet,
  type StageGroup,
} from '../curriculum/mathEngine';
import {
  resolveRemediationIds,
  STAGE_TO_KUMON_RANK,
} from '../curriculum/remediationMap';
import type { StepDocument } from '../types/curriculum';

export {
  ALL_MICRO_STEPS,
  MICRO_STEPS_BY_ID,
  MICRO_STEPS_BY_STAGE,
  STAGE_GROUPS,
  STAGE_TO_KUMON_RANK,
};
export type { GeneratedWorksheet, StageGroup };

const LEGACY_STEP_REDIRECT: Record<string, string> = {
  'E-CALC-001': 'E5-FADD-001',
  'E-CALC-002': 'E6-FMUL-001',
  'J1-EQ-001': 'J1-EQ-4-001',
  'M3-INT-010': 'H3-INT-BASE-001',
  'M3-INT-011': 'H3-DIFF-001',
  'M3-INT-011b': 'H3-INT-SUB-001',
  'M3-INT-012': 'H3-INT-SUB-002',
  'M3-INT-013': 'H3-INT-SUB-005',
};

export function resolveStepId(stepId: string): string {
  if (MICRO_STEPS_BY_ID[stepId]) return stepId;
  if (LEGACY_STEP_REDIRECT[stepId] && MICRO_STEPS_BY_ID[LEGACY_STEP_REDIRECT[stepId]]) {
    return LEGACY_STEP_REDIRECT[stepId];
  }
  return ALL_MICRO_STEPS[0].id;
}

export function getWorksheetData(
  stepId: string,
  variantNumber = 0
): GeneratedWorksheet {
  const resolvedId = resolveStepId(stepId);
  const spec = MICRO_STEPS_BY_ID[resolvedId] ?? ALL_MICRO_STEPS[0];
  return generateWorksheetData(spec, variantNumber);
}

export function getStepDocument(stepId: string, variantNumber = 0): StepDocument {
  const resolvedId = resolveStepId(stepId);
  const spec = MICRO_STEPS_BY_ID[resolvedId] ?? ALL_MICRO_STEPS[0];
  const orderIndex = ALL_MICRO_STEPS.findIndex((s) => s.id === spec.id);
  const prevId = orderIndex > 0 ? ALL_MICRO_STEPS[orderIndex - 1].id : null;

  return {
    frontmatter: {
      id: spec.id,
      title: spec.title,
      stage: spec.stage,
      category: spec.category,
      order: orderIndex + 1,
      prerequisites: prevId ? [prevId] : [],
      question_count: spec.questionCount,
      stats: {
        total_attempts: 0,
        pass_rate_avg: 0,
        clarity_score: 5.0,
        confused_notes: [],
      },
      version: 1,
      last_updated: '2026-11-25',
    },
    body: renderStepMarkdown(spec, variantNumber),
    filePath: `generated/${spec.id}.md`,
    isAuxiliary: false,
  };
}

export function getOrderedStepIds(): string[] {
  return ALL_MICRO_STEPS.map((s) => s.id);
}

export function getNextStepId(currentStepId: string): string | null {
  const resolvedId = resolveStepId(currentStepId);
  const idx = ALL_MICRO_STEPS.findIndex((s) => s.id === resolvedId);
  if (idx === -1 || idx + 1 >= ALL_MICRO_STEPS.length) {
    return null;
  }
  return ALL_MICRO_STEPS[idx + 1].id;
}

export function getStepSummary(stepId: string): {
  id: string;
  stage: StageGroup;
  category: string;
  title: string;
  questionCount: number;
  index: number;
} {
  const resolvedId = resolveStepId(stepId);
  const idx = ALL_MICRO_STEPS.findIndex((s) => s.id === resolvedId);
  const spec = ALL_MICRO_STEPS[idx >= 0 ? idx : 0];
  return {
    id: spec.id,
    stage: spec.stage,
    category: spec.category,
    title: spec.title,
    questionCount: spec.questionCount,
    index: idx >= 0 ? idx : 0,
  };
}

export function getRemediationSteps(stepId: string): Array<{
  id: string;
  stage: StageGroup;
  category: string;
  title: string;
  index: number;
}> {
  const resolvedId = resolveStepId(stepId);
  const spec = MICRO_STEPS_BY_ID[resolvedId];
  if (!spec) return [];
  const targetIds = resolveRemediationIds(spec.id, spec.remediationIds);
  return targetIds
    .filter((id) => Boolean(MICRO_STEPS_BY_ID[id]))
    .map((id) => {
      const s = getStepSummary(id);
      return {
        id: s.id,
        stage: s.stage,
        category: s.category,
        title: s.title,
        index: s.index,
      };
    });
}
