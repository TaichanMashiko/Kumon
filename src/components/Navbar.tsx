import { BookOpen, LogOut, MessageSquarePlus } from 'lucide-react';
import type { UserAccount } from '../types/curriculum';

interface NavbarProps {
  user: UserAccount;
  stepSubtitle?: string;
  onOpenFeedback?: () => void;
  onLogout: () => void;
}

export function Navbar({
  user,
  stepSubtitle,
  onOpenFeedback,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-teal-900/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="shrink-0 text-sm font-bold tracking-tight text-slate-900">
            マスステップ
          </span>
          {stepSubtitle && (
            <>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="hidden truncate text-xs font-medium text-slate-500 sm:inline">
                {stepSubtitle}
              </span>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-teal-400 hover:text-teal-800"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ご意見・報告</span>
            </button>
          )}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs font-semibold text-slate-700">{user.name}</span>
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
              {user.role === 'teacher' ? '教員' : user.classLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  );
}
