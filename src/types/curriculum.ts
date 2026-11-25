export interface StepStats {
  total_attempts: number;
  pass_rate_avg: number;
  clarity_score: number;
  confused_notes: string[];
}

export interface StepFrontmatter {
  id: string;
  title: string;
  stage: string;
  category: string;
  order: number;
  prerequisites: string[];
  question_count?: number;
  stats: StepStats;
  version: number;
  last_updated: string;
}

export interface StepDocument {
  frontmatter: StepFrontmatter;
  body: string;
  filePath: string;
  isAuxiliary: boolean;
}

export interface CurriculumStepNode {
  id: string;
  title: string;
  order: number;
  prerequisites: string[];
  file: string;
  is_auxiliary?: boolean;
  question_count?: number;
}

export interface CurriculumUnit {
  unit_id: string;
  title: string;
  stage: string;
  stage_level: 1 | 2 | 3 | 4; // 1:小学 2:中学 3:高校基礎 4:大学受験(数Ⅲ)
  category: string;
  description: string;
  steps: CurriculumStepNode[];
}

export interface CurriculumMap {
  version: number;
  last_updated: string;
  pass_threshold_percent?: number;
  units: CurriculumUnit[];
}

export type UserRole = 'student' | 'teacher';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  classLabel: string;
  grade?: string;
  classNumber?: number;
  studentNumber?: number;
  initials: string;
}

export interface ClarityRating {
  stepId: string;
  score: 1 | 2 | 3 | 4 | 5;
  updatedAt: string;
}

export interface ConfusionNoteEntry {
  id: string;
  stepId: string;
  text: string;
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  stepId: string;
  accuracyPercent: number;
  correctCount?: number;
  totalCount?: number;
  passed: boolean;
  mode: 'teacher' | 'self-study';
  variantId?: string;
  approvedBy: string;
  approvedAt: string;
  comment?: string;
}

export interface VariantProblemSet {
  id: string;
  stepId: string;
  variantNumber: number;
  questionCount: number;
  markdown: string;
  createdAt: string;
  createdBy: 'gemini' | 'preset';
}

export interface AiChatMessage {
  id: string;
  role: 'student' | 'tutor';
  text: string;
  createdAt: string;
}

export interface ActiveRemediationContext {
  targetStepId: string;
  remediationStepId: string;
  accuracyBefore: number;
  startedAt: string;
  remediationPassed?: boolean;
}

export interface RemediationOutcomeRecord {
  id: string;
  studentId: string;
  targetStepId: string;
  remediationStepId: string;
  accuracyBefore: number;
  accuracyAfter: number;
  accuracyGain: number;
  passedAfter: boolean;
  recordedAt: string;
}

export interface StudentProgress {
  studentId: string;
  selfStudyEnabled: boolean;
  passThresholdPercent: number; // default 90 (self-study enforces >= 90)
  completedStepIds: string[];
  currentStepId: string;
  streakCount: number;
  totalSolvedProblems: number;
  /** stepId -> active variant index (0 = original, 1+ = variant set #) */
  activeVariantByStep: Record<string, number>;
  /** stepIds that had <90% attempt and are queued for spaced review */
  reviewQueueStepIds: string[];
  /** Tracks active remediation loop so we measure whether returning to a prerequisite fixes the target step */
  activeRemediation?: ActiveRemediationContext;
  /** Historical remediation correlation outcomes for weekly curriculum evolution */
  remediationOutcomes?: RemediationOutcomeRecord[];
  clarityRatings: Record<string, ClarityRating>;
  confusionNotes: ConfusionNoteEntry[];
  approvals: ApprovalRecord[];
}

export interface FeedbackStepLog {
  step_id: string;
  new_attempts: number;
  accuracy_samples: number[];
  clarity_scores: number[];
  confused_notes: string[];
}

export interface FeedbackExportLog {
  exported_at: string;
  source: string;
  steps: FeedbackStepLog[];
  remediation_outcomes: RemediationOutcomeRecord[];
}
