import { useCallback, useMemo, useState } from 'react';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { clearUserSession, getSavedUser, getStudentAccounts, saveUserSession } from './lib/auth';
import { loadAllSteps } from './lib/contentLoader';
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
import { loadSharedVariantPool } from './lib/variantStore';
import type { UserAccount, VariantProblemSet } from './types/curriculum';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() => getSavedUser());
  const [progressStore, setProgressStore] = useState<ProgressMap>(() => loadProgressStore());
  const [variantPool, setVariantPool] = useState<VariantProblemSet[]>(() =>
    loadSharedVariantPool()
  );
  const stepsById = useMemo(() => loadAllSteps(), []);

  const refreshVariantPool = useCallback(() => {
    setVariantPool(loadSharedVariantPool());
  }, []);

  const handleLogin = (account: UserAccount) => {
    saveUserSession(account);
    setUser(account);
  };

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={handleLogout} />

      {user.role === 'student' && progressStore[user.id] ? (
        <StudentDashboard
          user={user}
          stepsById={stepsById}
          progress={progressStore[user.id]}
          onRateClarity={(stepId, score) =>
            setProgressStore((prev) => recordClarityRating(prev, user.id, stepId, score))
          }
          onAddConfusionNote={(stepId, note) =>
            setProgressStore((prev) => recordConfusionNote(prev, user.id, stepId, note))
          }
          onSelfGradeSubmit={(stepId, correctCount, totalCount, variantId) => {
            const accuracyPercent = Math.round((correctCount / totalCount) * 100);
            const result = submitStepAttempt(progressStore, {
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
            return { passed: result.passed, nextStepId: result.nextStepId };
          }}
          onSelectVariantNumber={(stepId, variantNumber) =>
            setProgressStore((prev) =>
              setActiveVariantForStep(prev, user.id, stepId, variantNumber)
            )
          }
          onVariantPoolChanged={refreshVariantPool}
        />
      ) : (
        <TeacherDashboard
          teacher={user}
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
            return { passed: result.passed };
          }}
          onToggleSelfStudy={(studentId, enabled) =>
            setProgressStore((prev) => toggleStudentSelfStudy(prev, studentId, enabled))
          }
          onBulkToggleSelfStudy={(enabled) => {
            let next = progressStore;
            for (const stu of getStudentAccounts()) {
              next = toggleStudentSelfStudy(next, stu.id, enabled);
            }
            setProgressStore(next);
          }}
          onUpdatePassThreshold={(studentId, threshold) =>
            setProgressStore((prev) => updateStudentPassThreshold(prev, studentId, threshold))
          }
          onResetDemo={() => setProgressStore(resetProgressStore())}
        />
      )}
    </div>
  );
}
