import { buildElementaryCatalog } from './elementaryCatalog';
import { buildHighSchoolCatalog } from './highSchoolCatalog';
import { buildJuniorHighCatalog } from './juniorHighCatalog';
import type { MicroStepSpec, StageGroup } from './mathEngine';
import { buildUniversityExamCatalog } from './universityExamCatalog';

export const STAGE_GROUPS: StageGroup[] = [
  '小学校1年',
  '小学校2年',
  '小学校3年',
  '小学校4年',
  '小学校5年',
  '小学校6年',
  '中学校1年',
  '中学校2年',
  '中学校3年',
  '高校 数学Ⅰ',
  '高校 数学A',
  '高校 数学Ⅱ',
  '高校 数学B',
  '高校 数学C',
  '高校 数学Ⅲ',
  '大学入試（茨城大・筑波大）',
];

export const ALL_MICRO_STEPS: MicroStepSpec[] = [
  ...buildElementaryCatalog(),
  ...buildJuniorHighCatalog(),
  ...buildHighSchoolCatalog(),
  ...buildUniversityExamCatalog(),
];

export const MICRO_STEPS_BY_ID: Record<string, MicroStepSpec> = Object.fromEntries(
  ALL_MICRO_STEPS.map((s) => [s.id, s])
);

export const MICRO_STEPS_BY_STAGE: Record<StageGroup, MicroStepSpec[]> =
  STAGE_GROUPS.reduce(
    (acc, stage) => {
      acc[stage] = ALL_MICRO_STEPS.filter((s) => s.stage === stage);
      return acc;
    },
    {} as Record<StageGroup, MicroStepSpec[]>
  );
