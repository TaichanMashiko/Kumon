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
  StudentProgress,
  UserAccount,
  VariantProblemSet,
} from '../types/curriculum';
import { db, isFirebaseConfigured } from './firebase';
import { DEFAULT_PASS_THRESHOLD, type ProgressMap } from './store';

export function createDefaultStudentProgress(studentId: string): StudentProgress {
  return {
    studentId,
    selfStudyEnabled: false,
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
  };
}

export async function ensureUserInFirestore(user: UserAccount): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  await setDoc(
    doc(db, 'users', user.id),
    {
      ...user,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  if (user.role === 'student') {
    const progRef = doc(db, 'student_progress', user.id);
    const snap = await getDoc(progRef);
    if (!snap.exists()) {
      await setDoc(progRef, createDefaultStudentProgress(user.id));
    }
  }
}

export async function saveStudentProgressToFirestore(
  progress: StudentProgress
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await setDoc(doc(db, 'student_progress', progress.studentId), progress, {
    merge: true,
  });
}

export function subscribeSingleStudentProgress(
  studentId: string,
  onUpdate: (progress: StudentProgress) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const ref = doc(db, 'student_progress', studentId);
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
    collection(db, 'users'),
    where('role', '==', 'student')
  );
  const unsubUsers = onSnapshot(studentsQuery, (snap) => {
    latestStudents = snap.docs
      .map((d) => d.data() as UserAccount)
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    emit();
  });

  const unsubProgress = onSnapshot(collection(db, 'student_progress'), (snap) => {
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

export async function fetchSharedVariantFromFirestore(
  stepId: string,
  variantNumber: number
): Promise<VariantProblemSet | null> {
  if (!isFirebaseConfigured || !db) return null;
  const variantId = `${stepId}-v${variantNumber}`;
  const snap = await getDoc(doc(db, 'shared_variants', variantId));
  if (!snap.exists()) return null;
  return snap.data() as VariantProblemSet;
}

export async function saveSharedVariantToFirestore(
  variant: VariantProblemSet
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await setDoc(doc(db, 'shared_variants', variant.id), variant, { merge: true });
}

export function subscribeSharedVariantsFromFirestore(
  onUpdate: (variants: VariantProblemSet[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  return onSnapshot(collection(db, 'shared_variants'), (snap) => {
    const list = snap.docs
      .map((d) => d.data() as VariantProblemSet)
      .sort((a, b) => a.id.localeCompare(b.id));
    onUpdate(list);
  });
}
