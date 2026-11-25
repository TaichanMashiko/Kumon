import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../types/curriculum';

interface RoleSetupViewProps {
  name: string;
  email: string;
  onComplete: (role: UserRole, displayName: string, classLabel: string) => Promise<void>;
  onCancel: () => void;
}

export function RoleSetupView({
  name,
  email,
  onComplete,
  onCancel,
}: RoleSetupViewProps) {
  const [role, setRole] = useState<UserRole>('student');
  const [displayName, setDisplayName] = useState(name);
  const [classLabel, setClassLabel] = useState('高校3年 1組');
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
      await onComplete(
        role,
        displayName.trim(),
        classLabel.trim() || (role === 'teacher' ? '数学科' : '生徒')
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '登録に失敗しました。もう一度お試しください。'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F8FA] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <h1 className="text-lg font-bold tracking-tight text-neutral-900">
          アカウント設定
        </h1>
        <p className="mt-1 text-xs text-neutral-500">{email}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setClassLabel('高校3年 1組');
                setError(null);
              }}
              className={`rounded-xl border py-3 text-sm font-semibold transition ${
                role === 'student'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              生徒
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setClassLabel('数学科');
                setError(null);
              }}
              className={`rounded-xl border py-3 text-sm font-semibold transition ${
                role === 'teacher'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              教員
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700">お名前</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700">
              {role === 'teacher' ? '担当教科' : '学年・クラス'}
            </label>
            <input
              type="text"
              value={classLabel}
              onChange={(e) => setClassLabel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {role === 'teacher' && requiredPasscode && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                教員パスコード
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
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
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
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
