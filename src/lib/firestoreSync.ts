import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  RemediationOutcomeRecord,
  StudentProgress,
  UserAccount,
  VariantProblemSet,
} from '../types/curriculum';
import { db, isFirebaseConfigured } from './firebase';
import { DEFAULT_PASS_THRESHOLD, type ProgressMap } from './store';

const COL_USERS = 'kumon_users';
const COL_PROGRESS = 'kumon_student_progress';
const COL_VARIANTS = 'kumon_shared_variants';
const COL_REMEDIATION_ANALYTICS = 'kumon_remediation_analytics';
const COL_APP_FEEDBACK = 'kumon_app_feedback';

export interface AppFeedbackRecord {
  id: string;
  userId: string;
  userRole: string;
  category: string;
  message: string;
  stepId: string;
  stepTitle: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

export async function saveAppFeedbackToFirestore(
  feedback: AppFeedbackRecord
): Promise<void> {
  try {
    const localKey = 'mathstep_app_feedback_v1';
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    existing.unshift(feedback);
    localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 100)));
  } catch {
    // Ignore local storage errors
  }

  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, COL_APP_FEEDBACK, feedback.id), stripUndefined(feedback));
  } catch (err) {
    console.error('[Firestore] フィードバックの保存に失敗しました:', err);
  }
}

export function createDefaultStudentProgress(studentId: string): StudentProgress {
  return {
    studentId,
    selfStudyEnabled: false,
    passThresholdPercent: DEFAULT_PASS_THRESHOLD,
    completedStepIds: [],
    currentStepId: 'E1-ADD1-001',
    streakCount: 0,
    totalSolvedProblems: 0,
    activeVariantByStep: {},
    reviewQueueStepIds: [],
    clarityRatings: {},
    confusionNotes: [],
    approvals: [],
  };
}

export async function fetchUserProfileFromFirestore(
  uid: string
): Promise<UserAccount | null> {
  if (!isFirebaseConfigured || !db) return null;
  const snap = await getDoc(doc(db, COL_USERS, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserAccount;
}

export async function ensureUserInFirestore(user: UserAccount): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  await setDoc(
    doc(db, COL_USERS, user.id),
    {
      ...user,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  if (user.role === 'student') {
    const progRef = doc(db, COL_PROGRESS, user.id);
    const snap = await getDoc(progRef);
    if (!snap.exists()) {
      await setDoc(progRef, createDefaultStudentProgress(user.id));
    }
  }
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        result[k] = stripUndefined(v);
      }
    }
    return result as T;
  }
  return value;
}

export async function saveStudentProgressToFirestore(
  progress: StudentProgress
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(
      doc(db, COL_PROGRESS, progress.studentId),
      stripUndefined(progress)
    );
  } catch (err) {
    console.error('[Firestore] 進捗データの保存に失敗しました:', err);
  }
}

export function subscribeSingleStudentProgress(
  studentId: string,
  onUpdate: (progress: StudentProgress) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const ref = doc(db, COL_PROGRESS, studentId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as StudentProgress);
    } else {
      onUpdate(createDefaultStudentProgress(studentId));
    }
  });
}

export function subscribeTeacherDashboardData(
  onUpdate: (students: UserAccount[], progressMap: ProgressMap) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }

  let latestStudents: UserAccount[] = [];
  let latestProgress: ProgressMap = {};

  const emit = () => {
    const mergedProgress: ProgressMap = { ...latestProgress };
    for (const s of latestStudents) {
      if (!mergedProgress[s.id]) {
        mergedProgress[s.id] = createDefaultStudentProgress(s.id);
      }
    }
    onUpdate(latestStudents, mergedProgress);
  };

  const studentsQuery = query(
    collection(db, COL_USERS),
    where('role', '==', 'student')
  );
  const unsubUsers = onSnapshot(studentsQuery, (snap) => {
    latestStudents = snap.docs
      .map((d) => d.data() as UserAccount)
      .sort((a, b) => {
        const gCmp = (a.grade || '').localeCompare(b.grade || '', 'ja');
        if (gCmp !== 0) return gCmp;
        const cCmp = (a.classNumber ?? 99) - (b.classNumber ?? 99);
        if (cCmp !== 0) return cCmp;
        const nCmp = (a.studentNumber ?? 999) - (b.studentNumber ?? 999);
        if (nCmp !== 0) return nCmp;
        return a.name.localeCompare(b.name, 'ja');
      });
    emit();
  });

  const unsubProgress = onSnapshot(collection(db, COL_PROGRESS), (snap) => {
    const map: ProgressMap = {};
    for (const d of snap.docs) {
      map[d.id] = d.data() as StudentProgress;
    }
    latestProgress = map;
    emit();
  });

  return () => {
    unsubUsers();
    unsubProgress();
  };
}

export async function saveRemediationOutcomeToFirestore(
  outcome: RemediationOutcomeRecord
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(
      doc(db, COL_REMEDIATION_ANALYTICS, outcome.id),
      stripUndefined(outcome)
    );
  } catch (err) {
    console.error('[Firestore] 戻り学習相関データの保存に失敗しました:', err);
  }
}

export async function fetchSharedVariantFromFirestore(
  stepId: string,
  variantNumber: number
): Promise<VariantProblemSet | null> {
  if (!isFirebaseConfigured || !db) return null;
  const variantId = `${stepId}-v${variantNumber}`;
  const snap = await getDoc(doc(db, COL_VARIANTS, variantId));
  if (!snap.exists()) return null;
  return snap.data() as VariantProblemSet;
}

export async function saveSharedVariantToFirestore(
  variant: VariantProblemSet
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await setDoc(doc(db, COL_VARIANTS, variant.id), variant, { merge: true });
}

export function subscribeSharedVariantsFromFirestore(
  onUpdate: (variants: VariantProblemSet[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  return onSnapshot(collection(db, COL_VARIANTS), (snap) => {
    const list = snap.docs
      .map((d) => d.data() as VariantProblemSet)
      .sort((a, b) => a.id.localeCompare(b.id));
    onUpdate(list);
  });
}
