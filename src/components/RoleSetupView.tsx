import { useState } from 'react';
import { BookOpen, GraduationCap, Loader2, ShieldCheck } from 'lucide-react';
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
      setError('教員登録パスコードが正しくありません。');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onComplete(
        role,
        displayName.trim(),
        classLabel.trim() || (role === 'teacher' ? '数学科 担当' : '生徒')
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'アカウント登録に失敗しました。もう一度お試しください。'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">初回アカウント登録</h1>
            <p className="text-xs text-slate-500">{email} でログインしました</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          はじめに「生徒」か「教員」かを選択してください。次回からは自動的に該当の画面が開きます。
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setClassLabel('高校3年 1組');
                setError(null);
              }}
              className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition ${
                role === 'student'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap
                className={`h-7 w-7 ${role === 'student' ? 'text-blue-600' : 'text-slate-400'}`}
              />
              <span className="mt-2 text-sm font-bold">生徒として使う</span>
              <span className="mt-0.5 text-[11px] text-slate-500">
                問題を解く・AI先生に質問
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setClassLabel('数学科 担当');
                setError(null);
              }}
              className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition ${
                role === 'teacher'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck
                className={`h-7 w-7 ${role === 'teacher' ? 'text-emerald-600' : 'text-slate-400'}`}
              />
              <span className="mt-2 text-sm font-bold">教員として使う</span>
              <span className="mt-0.5 text-[11px] text-slate-500">
                進度承認・自習モード管理
              </span>
            </button>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700">お名前（表示名）</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例：山田 太郎"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Class / Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700">
              {role === 'teacher' ? '担当教科・所属' : '学年・クラス'}
            </label>
            <input
              type="text"
              value={classLabel}
              onChange={(e) => setClassLabel(e.target.value)}
              placeholder={role === 'teacher' ? '例：数学科 担当' : '例：高校3年 2組'}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Optional Teacher Passcode */}
          {role === 'teacher' && requiredPasscode && (
            <div>
              <label className="block text-xs font-bold text-slate-700">
                教員登録パスコード
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="教員用パスコードを入力"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              別のアカウントでログイン
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 ${
                role === 'teacher'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              登録してはじめる
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
