import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../types/curriculum';

export interface RoleSetupPayload {
  role: UserRole;
  displayName: string;
  classLabel: string;
  grade?: string;
  classNumber?: number;
  studentNumber?: number;
}

interface RoleSetupViewProps {
  name: string;
  email: string;
  onComplete: (payload: RoleSetupPayload) => Promise<void>;
  onCancel: () => void;
}

const GRADE_OPTIONS = [
  '小学1年',
  '小学2年',
  '小学3年',
  '小学4年',
  '小学5年',
  '小学6年',
  '中学1年',
  '中学2年',
  '中学3年',
  '高校1年',
  '高校2年',
  '高校3年',
];

const CLASS_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);
const STUDENT_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

export function RoleSetupView({
  name,
  email,
  onComplete,
  onCancel,
}: RoleSetupViewProps) {
  const [role, setRole] = useState<UserRole>('student');
  const [displayName, setDisplayName] = useState(name);
  const [grade, setGrade] = useState('高校1年');
  const [classNumber, setClassNumber] = useState<number>(1);
  const [studentNumber, setStudentNumber] = useState<number>(1);
  const [teacherDept, setTeacherDept] = useState('数学科');
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredPasscode = (import.meta.env.VITE_TEACHER_PASSCODE || '').trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('お名前を入力してください。');
      return;
    }
    if (role === 'teacher' && requiredPasscode && passcode.trim() !== requiredPasscode) {
      setError('教員パスコードが正しくありません。');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (role === 'student') {
        await onComplete({
          role: 'student',
          displayName: displayName.trim(),
          classLabel: `${grade} ${classNumber}組 ${studentNumber}番`,
          grade,
          classNumber,
          studentNumber,
        });
      } else {
        await onComplete({
          role: 'teacher',
          displayName: displayName.trim(),
          classLabel: teacherDept.trim() || '数学科',
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '登録に失敗しました。もう一度お試しください。'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F6F4] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          アカウント登録
        </h1>
        <p className="mt-1 text-xs text-slate-500">{email}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError(null);
              }}
              className={`rounded-xl border py-3 text-sm font-semibold transition ${
                role === 'student'
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              生徒
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setError(null);
              }}
              className={`rounded-xl border py-3 text-sm font-semibold transition ${
                role === 'teacher'
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              教員
            </button>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">お名前</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例：山田 太郎"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>

          {/* Student: Grade / Class / Attendance Number Dropdowns */}
          {role === 'student' ? (
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">学年</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-none"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">組</label>
                <select
                  value={classNumber}
                  onChange={(e) => setClassNumber(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-none"
                >
                  {CLASS_NUMBERS.map((c) => (
                    <option key={c} value={c}>
                      {c}組
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">番号</label>
                <select
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-none"
                >
                  {STUDENT_NUMBERS.map((n) => (
                    <option key={n} value={n}>
                      {n}番
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700">担当教科</label>
              <input
                type="text"
                value={teacherDept}
                onChange={(e) => setTeacherDept(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
              />
            </div>
          )}

          {role === 'teacher' && requiredPasscode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                教員パスコード
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              はじめる
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
