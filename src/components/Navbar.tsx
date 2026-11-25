import { LogOut } from 'lucide-react';
import type { UserAccount } from '../types/curriculum';

interface NavbarProps {
  user: UserAccount;
  stepSubtitle?: string;
  onLogout: () => void;
}

export function Navbar({ user, stepSubtitle, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold tracking-tighter text-white">
            M
          </div>
          <span className="shrink-0 text-sm font-bold tracking-tight text-neutral-900">
            マスステップ
          </span>
          {stepSubtitle && (
            <>
              <span className="hidden text-neutral-300 sm:inline">/</span>
              <span className="hidden truncate text-xs font-medium text-neutral-500 sm:inline">
                {stepSubtitle}
              </span>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs font-medium text-neutral-700">{user.name}</span>
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
              {user.role === 'teacher' ? '教員' : user.classLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  );
}
