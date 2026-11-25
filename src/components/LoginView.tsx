import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DEMO_ACCOUNTS, signInWithGoogleFirebase } from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebase';
import type { UserAccount } from '../types/curriculum';

interface LoginViewProps {
  onDemoLogin: (user: UserAccount) => void;
}

export function LoginView({ onDemoLogin }: LoginViewProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogleFirebase();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'ログインに失敗しました。時間をおいて再度お試しください。'
      );
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F8FA] px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-base font-bold tracking-tight text-white">
            M
          </div>
          <h1 className="mt-4 text-lg font-bold tracking-tight text-neutral-900">
            マスステップ
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            ステップアップ式 デジタル数学学習
          </p>
        </div>

        {isFirebaseConfigured ? (
          <div className="mt-8">
            <button
              type="button"
              disabled={signingIn}
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {signingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.6 6.4C.6 8.1 0 10 0 12s.6 3.9 1.6 5.6l3.7-2.8z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.4 7.4 23 12 23z"
                  />
                </svg>
              )}
              <span>Googleアカウントでログイン</span>
            </button>

            {authError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {authError}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-7 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => onDemoLogin(account)}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-3.5 py-2.5 text-left text-xs transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                <span className="font-semibold text-neutral-900">{account.name}</span>
                <span className="text-neutral-500">
                  {account.role === 'teacher' ? '教員' : '生徒'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
