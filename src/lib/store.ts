import type {
  FeedbackExportLog,
  FeedbackStepLog,
  StudentProgress,
} from '../types/curriculum';
import { getNextStepId } from './contentLoader';

const STORE_KEY = 'mathstep_progress_store_v2';
export const DEFAULT_PASS_THRESHOLD = 90;

export type ProgressMap = Record<string, StudentProgress>;

function createInitialProgress(): ProgressMap {
  return {
    'stu-001': {
      studentId: 'stu-001',
      selfStudyEnabled: true, // 冬休み自習モード開放済み（すぐ体験可能）
      passThresholdPercent: DEFAULT_PASS_THRESHOLD,
      completedStepIds: ['E-CALC-001', 'E-CALC-002', 'J1-EQ-001', 'M3-INT-010', 'M3-INT-011', 'M3-INT-011b'],
      currentStepId: 'M3-INT-012',
      streakCount: 3,
      totalSolvedProblems: 28,
      activeVariantByStep: {},
      reviewQueueStepIds: [],
      clarityRatings: {
        'M3-INT-010': {
          stepId: 'M3-INT-010',
          score: 5,
          updatedAt: '2026-11-21T10:15:00+09:00',
        },
        'M3-INT-011': {
          stepId: 'M3-INT-011',
          score: 4,
          updatedAt: '2026-11-23T14:20:00+09:00',
        },
        'M3-INT-012': {
          stepId: 'M3-INT-012',
          score: 2,
          updatedAt: '2026-11-25T09:10:00+09:00',
        },
      },
      confusionNotes: [
        {
          id: 'note-init-1',
          stepId: 'M3-INT-012',
          text: 'tに置いた後のdxからdtへの変換が分からない',
          createdAt: '2026-11-25T09:12:00+09:00',
        },
      ],
      approvals: [
        {
          id: 'app-init-1',
          stepId: 'M3-INT-010',
          accuracyPercent: 100,
          correctCount: 4,
          totalCount: 4,
          passed: true,
          mode: 'teacher',
          approvedBy: '山田 太郎 先生',
          approvedAt: '2026-11-21T10:35:00+09:00',
          comment: '計算が丁寧で検算もできています。',
        },
        {
          id: 'app-init-2',
          stepId: 'M3-INT-011',
          accuracyPercent: 100,
          correctCount: 5,
          totalCount: 5,
          passed: true,
          mode: 'teacher',
          approvedBy: '山田 太郎 先生',
          approvedAt: '2026-11-23T14:45:00+09:00',
          comment: '塊の見つけ方はバッチリです。',
        },
      ],
    },
    'stu-002': {
      studentId: 'stu-002',
      selfStudyEnabled: false, // 通常モード（教員のみ承認可能）
      passThresholdPercent: DEFAULT_PASS_THRESHOLD,
      completedStepIds: [],
      currentStepId: 'E-CALC-001',
      streakCount: 0,
      totalSolvedProblems: 0,
      activeVariantByStep: {},
      reviewQueueStepIds: [],
      clarityRatings: {},
      confusionNotes: [],
      approvals: [],
    },
    'stu-003': {
      studentId: 'stu-003',
      selfStudyEnabled: true,
      passThresholdPercent: DEFAULT_PASS_THRESHOLD,
      completedStepIds: [
        'E-CALC-001',
        'E-CALC-002',
        'J1-EQ-001',
        'M3-INT-010',
        'M3-INT-011',
        'M3-INT-011b',
        'M3-INT-012',
      ],
      currentStepId: 'M3-INT-013',
      streakCount: 5,
      totalSolvedProblems: 36,
      activeVariantByStep: {},
      reviewQueueStepIds: ['M3-INT-012'],
      clarityRatings: {
        'M3-INT-012': {
          stepId: 'M3-INT-012',
          score: 3,
          updatedAt: '2026-11-24T16:10:00+09:00',
        },
      },
      confusionNotes: [
        {
          id: 'note-init-2',
          stepId: 'M3-INT-012',
          text: '2xが式の外にないときどう変形すればいいか迷った',
          createdAt: '2026-11-24T16:15:00+09:00',
        },
      ],
      approvals: [
        {
          id: 'app-init-6',
          stepId: 'M3-INT-012',
          accuracyPercent: 100,
          correctCount: 4,
          totalCount: 4,
          passed: true,
          mode: 'self-study',
          approvedBy: '高橋 蓮（自習自己採点）',
          approvedAt: '2026-11-24T16:30:00+09:00',
        },
      ],
    },
  };
}

export function loadProgressStore(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const initial = createInitialProgress();
      localStorage.setItem(STORE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return createInitialProgress();
  }
}

export function saveProgressStore(store: ProgressMap): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

export function resetProgressStore(): ProgressMap {
  const fresh = createInitialProgress();
  saveProgressStore(fresh);
  return fresh;
}

export function toggleStudentSelfStudy(
  store: ProgressMap,
  studentId: string,
  enabled: boolean
): ProgressMap {
  const current = store[studentId];
  if (!current) return store;
  const updated: ProgressMap = {
    ...store,
    [studentId]: {
      ...current,
      selfStudyEnabled: enabled,
    },
  };
  saveProgressStore(updated);
  return updated;
}

export function updateStudentPassThreshold(
  store: ProgressMap,
  studentId: string,
  threshold: number
): ProgressMap {
  const current = store[studentId];
  if (!current) return store;
  const clamped = Math.min(100, Math.max(50, Math.round(threshold)));
  const updated: ProgressMap = {
    ...store,
    [studentId]: {
      ...current,
      passThresholdPercent: clamped,
    },
  };
  saveProgressStore(updated);
  return updated;
}

export function recordClarityRating(
  store: ProgressMap,
  studentId: string,
  stepId: string,
  score: 1 | 2 | 3 | 4 | 5
): ProgressMap {
  const current = store[studentId];
  if (!current) return store;

  const updated: ProgressMap = {
    ...store,
    [studentId]: {
      ...current,
      clarityRatings: {
        ...current.clarityRatings,
        [stepId]: {
          stepId,
          score,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };
  saveProgressStore(updated);
  return updated;
}

export function recordConfusionNote(
  store: ProgressMap,
  studentId: string,
  stepId: string,
  text: string
): ProgressMap {
  const current = store[studentId];
  if (!current || !text.trim()) return store;

  const updated: ProgressMap = {
    ...store,
    [studentId]: {
      ...current,
      confusionNotes: [
        {
          id: `note-${Date.now()}`,
          stepId,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        },
        ...current.confusionNotes,
      ],
    },
  };
  saveProgressStore(updated);
  return updated;
}

export interface SubmitAttemptParams {
  studentId: string;
  stepId: string;
  accuracyPercent: number;
  correctCount?: number;
  totalCount?: number;
  mode: 'teacher' | 'self-study';
  approvedBy: string;
  variantId?: string;
  comment?: string;
}

export function submitStepAttempt(
  store: ProgressMap,
  params: SubmitAttemptParams
): { store: ProgressMap; passed: boolean; nextStepId: string | null } {
  const current = store[params.studentId];
  if (!current) return { store, passed: false, nextStepId: null };

  const threshold = current.passThresholdPercent ?? DEFAULT_PASS_THRESHOLD;
  const passed = params.accuracyPercent >= threshold;
  const solvedDelta = params.totalCount ?? 4;

  const completedSet = new Set(current.completedStepIds);
  const reviewSet = new Set(current.reviewQueueStepIds);
  let nextCurrentStepId = current.currentStepId;
  let nextStepId: string | null = null;
  const nextVariantMap = { ...current.activeVariantByStep };

  if (passed) {
    completedSet.add(params.stepId);
    reviewSet.delete(params.stepId);
    nextStepId = getNextStepId(params.stepId);
    if (current.currentStepId === params.stepId && nextStepId) {
      nextCurrentStepId = nextStepId;
    }
    delete nextVariantMap[params.stepId];
  } else {
    // 90%未満は次へ進めず、同レベルの類題番号をインクリメントして再挑戦へ
    reviewSet.add(params.stepId);
    nextVariantMap[params.stepId] = (nextVariantMap[params.stepId] ?? 0) + 1;
  }

  const updated: ProgressMap = {
    ...store,
    [params.studentId]: {
      ...current,
      completedStepIds: Array.from(completedSet),
      currentStepId: nextCurrentStepId,
      streakCount: passed ? current.streakCount + 1 : 0,
      totalSolvedProblems: current.totalSolvedProblems + solvedDelta,
      activeVariantByStep: nextVariantMap,
      reviewQueueStepIds: Array.from(reviewSet),
      approvals: [
        {
          id: `app-${Date.now()}`,
          stepId: params.stepId,
          accuracyPercent: params.accuracyPercent,
          correctCount: params.correctCount,
          totalCount: params.totalCount,
          passed,
          mode: params.mode,
          variantId: params.variantId,
          approvedBy: params.approvedBy,
          approvedAt: new Date().toISOString(),
          comment: params.comment?.trim() || undefined,
        },
        ...current.approvals,
      ],
    },
  };
  saveProgressStore(updated);
  return { store: updated, passed, nextStepId };
}

export function setActiveVariantForStep(
  store: ProgressMap,
  studentId: string,
  stepId: string,
  variantNumber: number
): ProgressMap {
  const current = store[studentId];
  if (!current) return store;
  const updated: ProgressMap = {
    ...store,
    [studentId]: {
      ...current,
      activeVariantByStep: {
        ...current.activeVariantByStep,
        [stepId]: variantNumber,
      },
    },
  };
  saveProgressStore(updated);
  return updated;
}

export function buildFeedbackExportLog(store: ProgressMap): FeedbackExportLog {
  const byStep = new Map<string, FeedbackStepLog>();

  const ensureStep = (stepId: string): FeedbackStepLog => {
    let entry = byStep.get(stepId);
    if (!entry) {
      entry = {
        step_id: stepId,
        new_attempts: 0,
        accuracy_samples: [],
        clarity_scores: [],
        confused_notes: [],
      };
      byStep.set(stepId, entry);
    }
    return entry;
  };

  for (const progress of Object.values(store)) {
    for (const rating of Object.values(progress.clarityRatings)) {
      ensureStep(rating.stepId).clarity_scores.push(rating.score);
    }
    for (const note of progress.confusionNotes) {
      const entry = ensureStep(note.stepId);
      if (!entry.confused_notes.includes(note.text)) {
        entry.confused_notes.push(note.text);
      }
    }
    for (const app of progress.approvals) {
      const entry = ensureStep(app.stepId);
      entry.new_attempts += 1;
      entry.accuracy_samples.push(app.accuracyPercent);
    }
  }

  return {
    exported_at: new Date().toISOString(),
    source: 'mathstep-web-app',
    steps: Array.from(byStep.values()),
  };
}
