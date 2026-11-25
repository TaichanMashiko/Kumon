import { BookOpen, GraduationCap, LogOut, ShieldCheck } from 'lucide-react';
import type { UserAccount } from '../types/curriculum';

interface NavbarProps {
  user: UserAccount;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const isTeacher = user.role === 'teacher';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                MathStep
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                自律進化型 公文式デジタル数学
              </span>
            </div>
            <p className="text-xs text-slate-500">
              APIコストゼロ・ノート自学＆対面承認システム
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
            {isTeacher ? (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            ) : (
              <GraduationCap className="h-4 w-4 text-blue-600" />
            )}
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-800">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {user.classLabel} ・ {user.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
