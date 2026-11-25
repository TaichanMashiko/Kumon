import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import {
  clearUserSession,
  getSavedUser,
  getStudentAccounts,
  saveUserSession,
  signOutFirebase,
  subscribeFirebaseAuth,
} from './lib/auth';
import { loadAllSteps } from './lib/contentLoader';
import { isFirebaseConfigured } from './lib/firebase';
import {
  createDefaultStudentProgress,
  ensureUserInFirestore,
  saveStudentProgressToFirestore,
  subscribeSharedVariantsFromFirestore,
  subscribeSingleStudentProgress,
  subscribeTeacherDashboardData,
} from './lib/firestoreSync';
import {
  loadProgressStore,
  recordClarityRating,
  recordConfusionNote,
  resetProgressStore,
  setActiveVariantForStep,
  submitStepAttempt,
  toggleStudentSelfStudy,
  updateStudentPassThreshold,
  type ProgressMap,
} from './lib/store';
import {
  loadSharedVariantPool,
  PRESET_VARIANTS,
  saveSharedVariantPool,
} from './lib/variantStore';
import type { StudentProgress, UserAccount, VariantProblemSet } from './types/curriculum';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() =>
    isFirebaseConfigured ? null : getSavedUser()
  );
  const [authReady, setAuthReady] = useState<boolean>(!isFirebaseConfigured);
  const [students, setStudents] = useState<UserAccount[]>(() =>
    isFirebaseConfigured ? [] : getStudentAccounts()
  );
  const [progressStore, setProgressStore] = useState<ProgressMap>(() =>
    isFirebaseConfigured ? {} : loadProgressStore()
  );
  const [variantPool, setVariantPool] = useState<VariantProblemSet[]>(() =>
    loadSharedVariantPool()
  );
  const stepsById = useMemo(() => loadAllSteps(), []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeFirebaseAuth((account) => {
      setUser(account);
      setAuthReady(true);
      if (account) {
        void ensureUserInFirestore(account);
      }
    });
    return unsub;
  }, []);

  // Subscribe to Firestore real-time data based on role
  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;

    const unsubVariants = subscribeSharedVariantsFromFirestore((remoteVariants) => {
      const mergedMap = new Map<string, VariantProblemSet>();
      for (const p of PRESET_VARIANTS) mergedMap.set(p.id, p);
      for (const r of remoteVariants) mergedMap.set(r.id, r);
      const merged = Array.from(mergedMap.values());
      setVariantPool(merged);
      saveSharedVariantPool(merged);
    });

    if (user.role === 'student') {
      const unsubProg = subscribeSingleStudentProgress(user.id, (prog) => {
        setProgressStore((prev) => ({ ...prev, [user.id]: prog }));
      });
      return () => {
        unsubVariants();
        unsubProg();
      };
    }

    const unsubTeacher = subscribeTeacherDashboardData((remoteStudents, remoteProgress) => {
      setStudents(remoteStudents);
      setProgressStore(remoteProgress);
    });
    return () => {
      unsubVariants();
      unsubTeacher();
    };
  }, [user]);

  const refreshVariantPool = useCallback(() => {
    setVariantPool(loadSharedVariantPool());
  }, []);

  const persistIfFirebase = (prog: StudentProgress | undefined) => {
    if (isFirebaseConfigured && prog) {
      void saveStudentProgressToFirestore(prog);
    }
  };

  const handleLogin = (account: UserAccount) => {
    if (!isFirebaseConfigured) {
      saveUserSession(account);
    }
    setUser(account);
  };

  const handleLogout = () => {
    if (isFirebaseConfigured) {
      void signOutFirebase();
    } else {
      clearUserSession();
    }
    setUser(null);
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-600">
        Firebase 認証状態を確認中...
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  const currentStudentProgress =
    user.role === 'student'
      ? progressStore[user.id] ?? createDefaultStudentProgress(user.id)
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={handleLogout} />

      {user.role === 'student' && currentStudentProgress ? (
        <StudentDashboard
          user={user}
          stepsById={stepsById}
          progress={currentStudentProgress}
          onRateClarity={(stepId, score) => {
            setProgressStore((prev) => {
              const base = prev[user.id]
                ? prev
                : { ...prev, [user.id]: currentStudentProgress };
              const next = recordClarityRating(base, user.id, stepId, score);
              persistIfFirebase(next[user.id]);
              return next;
            });
          }}
          onAddConfusionNote={(stepId, note) => {
            setProgressStore((prev) => {
              const base = prev[user.id]
                ? prev
                : { ...prev, [user.id]: currentStudentProgress };
              const next = recordConfusionNote(base, user.id, stepId, note);
              persistIfFirebase(next[user.id]);
              return next;
            });
          }}
          onSelfGradeSubmit={(stepId, correctCount, totalCount, variantId) => {
            const accuracyPercent = Math.round((correctCount / totalCount) * 100);
            const base = progressStore[user.id]
              ? progressStore
              : { ...progressStore, [user.id]: currentStudentProgress };
            const result = submitStepAttempt(base, {
              studentId: user.id,
              stepId,
              accuracyPercent,
              correctCount,
              totalCount,
              mode: 'self-study',
              approvedBy: `${user.name}（自習自己採点）`,
              variantId,
            });
            setProgressStore(result.store);
            persistIfFirebase(result.store[user.id]);
            return { passed: result.passed, nextStepId: result.nextStepId };
          }}
          onSelectVariantNumber={(stepId, variantNumber) => {
            setProgressStore((prev) => {
              const base = prev[user.id]
                ? prev
                : { ...prev, [user.id]: currentStudentProgress };
              const next = setActiveVariantForStep(base, user.id, stepId, variantNumber);
              persistIfFirebase(next[user.id]);
              return next;
            });
          }}
          onVariantPoolChanged={refreshVariantPool}
        />
      ) : (
        <TeacherDashboard
          teacher={user}
          students={students}
          stepsById={stepsById}
          progressStore={progressStore}
          variantPool={variantPool}
          onApproveStep={(studentId, stepId, accuracyPercent, comment) => {
            const totalCount = stepsById[stepId]?.frontmatter.question_count ?? 4;
            const result = submitStepAttempt(progressStore, {
              studentId,
              stepId,
              accuracyPercent,
              totalCount,
              mode: 'teacher',
              approvedBy: user.name,
              comment,
            });
            setProgressStore(result.store);
            persistIfFirebase(result.store[studentId]);
            return { passed: result.passed };
          }}
          onToggleSelfStudy={(studentId, enabled) => {
            setProgressStore((prev) => {
              const next = toggleStudentSelfStudy(prev, studentId, enabled);
              persistIfFirebase(next[studentId]);
              return next;
            });
          }}
          onBulkToggleSelfStudy={(enabled) => {
            let next = progressStore;
            for (const stu of students) {
              next = toggleStudentSelfStudy(next, stu.id, enabled);
              persistIfFirebase(next[stu.id]);
            }
            setProgressStore(next);
          }}
          onUpdatePassThreshold={(studentId, threshold) => {
            setProgressStore((prev) => {
              const next = updateStudentPassThreshold(prev, studentId, threshold);
              persistIfFirebase(next[studentId]);
              return next;
            });
          }}
          onResetDemo={() => setProgressStore(resetProgressStore())}
        />
      )}
    </div>
  );
}
