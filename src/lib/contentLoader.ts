import yaml from 'js-yaml';
import curriculumMapRaw from '../../content/curriculum-map.json';
import type {
  CurriculumMap,
  StepDocument,
  StepFrontmatter,
} from '../types/curriculum';

const rawMarkdownFiles = import.meta.glob('../../content/units/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const curriculumMap = curriculumMapRaw as CurriculumMap;

function parseMarkdownWithFrontmatter(raw: string): {
  frontmatter: StepFrontmatter;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid Markdown format: missing YAML frontmatter');
  }
  const frontmatter = yaml.load(match[1]) as StepFrontmatter;
  const body = match[2].trim();
  return { frontmatter, body };
}

export function inferQuestionCount(body: string, explicitCount?: number): number {
  if (explicitCount && explicitCount > 0) return explicitCount;
  const practiceMatch = body.match(/# ✍️ 練習問題([\s\S]*?)(?:\n---|\n# 💡|$)/);
  if (!practiceMatch) return 4;
  const numbered = practiceMatch[1].match(/^\s*\d+\.\s+/gm);
  return numbered && numbered.length > 0 ? numbered.length : 4;
}

export function loadAllSteps(): Record<string, StepDocument> {
  const docsByPath: Record<string, { frontmatter: StepFrontmatter; body: string }> = {};

  for (const [globPath, raw] of Object.entries(rawMarkdownFiles)) {
    const normalizedPath = globPath.replace(/^\.\.\/\.\.\//, '');
    docsByPath[normalizedPath] = parseMarkdownWithFrontmatter(raw);
  }

  const stepsById: Record<string, StepDocument> = {};
  for (const unit of curriculumMap.units) {
    for (const node of unit.steps) {
      const parsed = docsByPath[node.file];
      if (parsed) {
        const questionCount = inferQuestionCount(
          parsed.body,
          node.question_count ?? parsed.frontmatter.question_count
        );
        stepsById[node.id] = {
          frontmatter: {
            ...parsed.frontmatter,
            question_count: questionCount,
          },
          body: parsed.body,
          filePath: node.file,
          isAuxiliary: Boolean(node.is_auxiliary),
        };
      }
    }
  }

  return stepsById;
}

export function getOrderedStepIds(): string[] {
  const ids: string[] = [];
  for (const unit of curriculumMap.units) {
    const sorted = [...unit.steps].sort((a, b) => a.order - b.order);
    for (const step of sorted) {
      ids.push(step.id);
    }
  }
  return ids;
}

export function getNextStepId(currentStepId: string): string | null {
  const ordered = getOrderedStepIds();
  const idx = ordered.indexOf(currentStepId);
  if (idx === -1 || idx + 1 >= ordered.length) {
    return null;
  }
  return ordered[idx + 1];
}

export function getStudentRankInfo(completedStepIds: string[]): {
  label: string;
  stageLevel: number;
  progressPercent: number;
} {
  const allIds = getOrderedStepIds();
  const doneSet = new Set(completedStepIds);
  const progressPercent =
    allIds.length > 0 ? Math.round((doneSet.size / allIds.length) * 100) : 0;

  let highestLevel = 1;
  for (const unit of curriculumMap.units) {
    const anyDone = unit.steps.some((s) => doneSet.has(s.id));
    if (anyDone && unit.stage_level > highestLevel) {
      highestLevel = unit.stage_level;
    }
  }

  if (progressPercent === 100) {
    return { label: '大学受験マスター到達', stageLevel: 4, progressPercent };
  }
  if (highestLevel >= 4) {
    return { label: '大学受験レベル挑戦中（数Ⅲ）', stageLevel: 4, progressPercent };
  }
  if (highestLevel === 3) {
    return { label: '高校数学レベル挑戦中', stageLevel: 3, progressPercent };
  }
  if (highestLevel === 2) {
    return { label: '中学数学レベル挑戦中', stageLevel: 2, progressPercent };
  }
  return { label: '小学基礎レベル挑戦中', stageLevel: 1, progressPercent };
}
