import { useState } from 'react';
import {
  BookOpen,
  Cloud,
  GraduationCap,
  Loader2,
  LogIn,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DEMO_ACCOUNTS, signInWithGoogleFirebase } from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebase';
import type { UserAccount } from '../types/curriculum';

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const students = DEMO_ACCOUNTS.filter((a) => a.role === 'student');
  const teachers = DEMO_ACCOUNTS.filter((a) => a.role === 'teacher');
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      const account = await signInWithGoogleFirebase();
      onLogin(account);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Googleログインに失敗しました。Firebase Console の承認済みドメイン設定を確認してください。'
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                MathStep — 公文式デジタル数学学習システム
              </h1>
              <p className="text-sm text-slate-500">
                Google Workspace for Education アカウントでログイン
              </p>
            </div>
          </div>

          <span
            className={`hidden items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${
              isFirebaseConfigured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" />
            {isFirebaseConfigured ? 'Firebase 接続済み' : 'デモモード'}
          </span>
        </div>

        <div className="mt-6 grid gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <div className="font-bold">ノートに鉛筆で自学</div>
              <div className="text-blue-800/80">
                小学レベルから大学受験まで。90%以上で次へ、未満は類題で再挑戦。
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <div className="font-bold">教員承認＆自習開放</div>
              <div className="text-blue-800/80">
                冬休み等はアカウントごとに自己採点（自習モード）を開放可能。
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <div className="font-bold">Firebase同期＆AI先生</div>
              <div className="text-blue-800/80">
                Firestoreで進度と類題を全生徒共有。質問はGeminiがサポート。
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Google Sign-In Section */}
        {isFirebaseConfigured && (
          <div className="mt-6 rounded-xl border-2 border-blue-200 bg-blue-50/40 p-5 text-center">
            <button
              type="button"
              disabled={signingIn}
              onClick={handleGoogleLogin}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
            >
              {signingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Googleアカウントでログイン（Firebase Auth）
            </button>
            <p className="mt-2 text-xs text-slate-600">
              教員メールアドレス（<code className="font-mono">tmashiko@kiryo.ac.jp</code> 等）は自動的に教員管理画面へ遷移します。
            </p>
            {authError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-left text-xs text-rose-800">
                {authError}
              </div>
            )}
          </div>
        )}

        {/* Demo Accounts (Fallback when Firebase env vars are not configured yet) */}
        {!isFirebaseConfigured && (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
              <strong>Firebase 未設定（デモモード）:</strong> Vercel の Environment Variables に{' '}
              <code className="font-mono">VITE_FIREBASE_*</code> を設定すると、Google認証＋Cloud Firestore 永続保存に自動切替されます。
            </div>

            <div>
              <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                生徒アカウントでデモ体験
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {students.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => onLogin(account)}
                    className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {account.initials}
                      </span>
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        生徒
                      </span>
                    </div>
                    <div className="mt-2.5 text-sm font-bold text-slate-900">
                      {account.name}
                    </div>
                    <div className="text-xs text-slate-500">{account.classLabel}</div>
                    <div className="mt-1 truncate text-[11px] text-slate-400">
                      {account.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                教員アカウントでデモ体験（管理・自習モード開放）
              </h2>
              <div className="grid gap-2.5">
                {teachers.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => onLogin(account)}
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/30 p-3.5 text-left transition hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {account.initials}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {account.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {account.classLabel} ・ {account.email}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                      教員画面へ
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
