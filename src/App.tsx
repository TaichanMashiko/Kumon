import { useCallback, useEffect, useState } from 'react';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { RoleSetupView, type RoleSetupPayload } from './components/RoleSetupView';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import {
  clearUserSession,
  getSavedUser,
  getStudentAccounts,
  saveUserSession,
  signOutFirebase,
  subscribeFirebaseAuth,
  type FirebaseIdentity,
} from './lib/auth';
import { getStepSummary } from './lib/contentLoader';
import { isFirebaseConfigured } from './lib/firebase';
import {
  createDefaultStudentProgress,
  ensureUserInFirestore,
  fetchUserProfileFromFirestore,
  saveRemediationOutcomeToFirestore,
  saveStudentProgressToFirestore,
  subscribeSharedVariantsFromFirestore,
  subscribeSingleStudentProgress,
  subscribeTeacherDashboardData,
} from './lib/firestoreSync';
import {
  assignStudentStep,
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
  saveSharedVariantPool,
} from './lib/variantStore';
import type {
  StudentProgress,
  UserAccount,
  VariantProblemSet,
} from './types/curriculum';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() =>
    isFirebaseConfigured ? null : getSavedUser()
  );
  const [pendingIdentity, setPendingIdentity] = useState<FirebaseIdentity | null>(null);
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

  // Subscribe to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeFirebaseAuth((identity) => {
      if (!identity) {
        setUser(null);
        setPendingIdentity(null);
        setAuthReady(true);
        return;
      }

      fetchUserProfileFromFirestore(identity.uid)
        .then((profile) => {
          if (profile) {
            setUser(profile);
            setPendingIdentity(null);
          } else {
            setUser(null);
            setPendingIdentity(identity);
          }
        })
        .catch(() => {
          setUser(null);
          setPendingIdentity(identity);
        })
        .finally(() => {
          setAuthReady(true);
        });
    });
    return unsub;
  }, []);

  // Subscribe to Firestore real-time data based on role
  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;

    const unsubVariants = subscribeSharedVariantsFromFirestore((remoteVariants) => {
      setVariantPool(remoteVariants);
      saveSharedVariantPool(remoteVariants);
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

  const handleDemoLogin = (account: UserAccount) => {
    if (!isFirebaseConfigured) {
      saveUserSession(account);
    }
    setUser(account);
  };

  const handleCompleteRoleSetup = async (payload: RoleSetupPayload) => {
    if (!pendingIdentity) return;
    const newAccount: UserAccount = {
      id: pendingIdentity.uid,
      name: payload.displayName,
      email: pendingIdentity.email,
      role: payload.role,
      classLabel: payload.classLabel,
      ...(payload.grade ? { grade: payload.grade } : {}),
      ...(payload.classNumber ? { classNumber: payload.classNumber } : {}),
      ...(payload.studentNumber ? { studentNumber: payload.studentNumber } : {}),
      initials: payload.displayName.slice(0, 1).toUpperCase(),
    };
    await ensureUserInFirestore(newAccount);
    setPendingIdentity(null);
    setUser(newAccount);
  };

  const handleLogout = () => {
    if (isFirebaseConfigured) {
      void signOutFirebase();
    } else {
      clearUserSession();
    }
    setPendingIdentity(null);
    setUser(null);
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] text-xs font-medium text-neutral-500">
        読み込み中...
      </div>
    );
  }

  if (pendingIdentity && !user) {
    return (
      <RoleSetupView
        name={pendingIdentity.name}
        email={pendingIdentity.email}
        onComplete={handleCompleteRoleSetup}
        onCancel={handleLogout}
      />
    );
  }

  if (!user) {
    return <LoginView onDemoLogin={handleDemoLogin} />;
  }

  const currentStudentProgress =
    user.role === 'student'
      ? progressStore[user.id] ?? createDefaultStudentProgress(user.id)
      : null;

  const currentStepTitle =
    user.role === 'student' && currentStudentProgress
      ? getStepSummary(currentStudentProgress.currentStepId).title
      : '教員管理';

  return (
    <div className="min-h-screen bg-[#F4F6F4]">
      <Navbar user={user} stepSubtitle={currentStepTitle} onLogout={handleLogout} />

      {user.role === 'student' && currentStudentProgress ? (
        <StudentDashboard
          user={user}
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
            if (isFirebaseConfigured && result.newRemediationOutcome) {
              void saveRemediationOutcomeToFirestore(result.newRemediationOutcome);
            }
            return { passed: result.passed, nextStepId: result.nextStepId };
          }}
          onStartRemediation={(
            remediationStepId,
            fromTargetStepId,
            lastAccuracy,
            studentReason
          ) => {
            setProgressStore((prev) => {
              const base = prev[user.id]
                ? prev
                : { ...prev, [user.id]: currentStudentProgress };
              const withNote = studentReason
                ? recordConfusionNote(base, user.id, fromTargetStepId, `[つまずき診断] ${studentReason}`)
                : base;
              const next = assignStudentStep(withNote, user.id, remediationStepId, {
                fromTargetStepId,
                lastAccuracy,
              });
              persistIfFirebase(next[user.id]);
              return next;
            });
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
          progressStore={progressStore}
          variantPool={variantPool}
          onApproveStep={(studentId, stepId, accuracyPercent, comment) => {
            const totalCount = getStepSummary(stepId).questionCount;
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
            if (isFirebaseConfigured && result.newRemediationOutcome) {
              void saveRemediationOutcomeToFirestore(result.newRemediationOutcome);
            }
            return { passed: result.passed };
          }}
          onAssignStep={(studentId, stepId, remediationMeta) => {
            setProgressStore((prev) => {
              const next = assignStudentStep(prev, studentId, stepId, remediationMeta);
              persistIfFirebase(next[studentId]);
              return next;
            });
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
