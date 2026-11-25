import { BookOpen, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { DEMO_ACCOUNTS } from '../lib/auth';
import type { UserAccount } from '../types/curriculum';

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const students = DEMO_ACCOUNTS.filter((a) => a.role === 'student');
  const teachers = DEMO_ACCOUNTS.filter((a) => a.role === 'teacher');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
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

        <div className="mt-6 grid gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <div className="font-bold">ノートに鉛筆で自学</div>
              <div className="text-blue-800/80">
                数式入力の手間ゼロ。画面を見てノートに解き、自己採点します。
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <div className="font-bold">教員による対面承認</div>
              <div className="text-blue-800/80">
                ノート確認後に合格承認と正答率を登録して次のステップへ。
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <div className="font-bold">非同期AI定期パッチ</div>
              <div className="text-blue-800/80">
                躓きメモと正答率から教材を自動改善・細分化します。
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              生徒アカウントでログイン（学校Googleアカウント モック）
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
              教員アカウントでログイン（管理・進度承認画面）
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

        <p className="mt-6 text-center text-[11px] text-slate-400">
          ※ 本MVPはローカル保存モードで即時動作します。本番環境では Firebase Auth (Google Workspace OAuth) に切替可能です。
        </p>
      </div>
    </div>
  );
}
