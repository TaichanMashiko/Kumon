import type { StudentProgress } from '../types/curriculum';

interface StudentAvatarCardProps {
  studentName: string;
  progress: StudentProgress;
}

interface CharacterTier {
  minLevel: number;
  title: string;
  accentBg: string;
  badgeColor: string;
  stageKey: 'egg' | 'chick' | 'owl' | 'scholar' | 'star' | 'sage';
}

const CHARACTER_TIERS: CharacterTier[] = [
  {
    minLevel: 1,
    title: 'めばえのタマゴ',
    accentBg: 'from-emerald-50 to-teal-50',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    stageKey: 'egg',
  },
  {
    minLevel: 3,
    title: 'ひよこチャレンジャー',
    accentBg: 'from-amber-50 to-yellow-50',
    badgeColor: 'bg-amber-100 text-amber-800',
    stageKey: 'chick',
  },
  {
    minLevel: 6,
    title: 'ふくろう見習い',
    accentBg: 'from-teal-50 to-cyan-50',
    badgeColor: 'bg-teal-100 text-teal-900',
    stageKey: 'owl',
  },
  {
    minLevel: 10,
    title: '知恵のふくろう博士',
    accentBg: 'from-sky-50 to-indigo-50',
    badgeColor: 'bg-sky-100 text-sky-900',
    stageKey: 'scholar',
  },
  {
    minLevel: 15,
    title: '星よみマスター',
    accentBg: 'from-violet-50 to-purple-50',
    badgeColor: 'bg-violet-100 text-violet-900',
    stageKey: 'star',
  },
  {
    minLevel: 21,
    title: '伝説の数学賢者',
    accentBg: 'from-amber-50 via-orange-50 to-rose-50',
    badgeColor: 'bg-orange-100 text-orange-900',
    stageKey: 'sage',
  },
];

function CharacterAvatarSvg({ stageKey }: { stageKey: CharacterTier['stageKey'] }) {
  if (stageKey === 'egg') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
        <ellipse cx="32" cy="36" rx="15" ry="18" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
        <path d="M21 34 L27 30 L32 35 L38 29 L43 34" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <circle cx="27" cy="40" r="2" fill="#1E293B" />
        <circle cx="37" cy="40" r="2" fill="#1E293B" />
        <path d="M29 44 Q32 46 35 44" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (stageKey === 'chick') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="2" />
        <circle cx="32" cy="36" r="16" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
        <path d="M30 20 Q32 14 35 19" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="26" cy="34" r="2.2" fill="#1E293B" />
        <circle cx="38" cy="34" r="2.2" fill="#1E293B" />
        <polygon points="32,37 29,41 35,41" fill="#EA580C" />
        <circle cx="22" cy="38" r="2.5" fill="#FCA5A5" opacity="0.7" />
        <circle cx="42" cy="38" r="2.5" fill="#FCA5A5" opacity="0.7" />
      </svg>
    );
  }
  if (stageKey === 'owl') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#F0FDFA" stroke="#99F6E4" strokeWidth="2" />
        <ellipse cx="32" cy="37" rx="17" ry="18" fill="#0F766E" />
        <polygon points="20,24 24,16 28,23" fill="#0F766E" />
        <polygon points="44,24 40,16 36,23" fill="#0F766E" />
        <ellipse cx="32" cy="43" rx="10" ry="10" fill="#CCFBF1" />
        <circle cx="26" cy="31" r="5" fill="#FFFFFF" />
        <circle cx="38" cy="31" r="5" fill="#FFFFFF" />
        <circle cx="26" cy="31" r="2.4" fill="#0F172A" />
        <circle cx="38" cy="31" r="2.4" fill="#0F172A" />
        <polygon points="32,34 29,38 35,38" fill="#F59E0B" />
      </svg>
    );
  }
  if (stageKey === 'scholar') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
        <ellipse cx="32" cy="39" rx="16" ry="16" fill="#0F766E" />
        <ellipse cx="32" cy="45" rx="10" ry="8" fill="#E0F2FE" />
        <polygon points="16,22 32,14 48,22 32,28" fill="#1E293B" />
        <line x1="46" y1="22" x2="46" y2="30" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="26" cy="34" r="4.8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="38" cy="34" r="4.8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="30.8" y1="34" x2="33.2" y2="34" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="26" cy="34" r="2" fill="#0F172A" />
        <circle cx="38" cy="34" r="2" fill="#0F172A" />
        <polygon points="32,37 29.5,41 34.5,41" fill="#F59E0B" />
      </svg>
    );
  }
  if (stageKey === 'star') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="2" />
        <ellipse cx="32" cy="40" rx="16" ry="15" fill="#4338CA" />
        <polygon points="20,27 32,10 44,27" fill="#312E81" />
        <circle cx="32" cy="18" r="2.5" fill="#FDE047" />
        <circle cx="26" cy="35" r="4.8" fill="#FFFFFF" />
        <circle cx="38" cy="35" r="4.8" fill="#FFFFFF" />
        <circle cx="26" cy="35" r="2.2" fill="#1E1B4B" />
        <circle cx="38" cy="35" r="2.2" fill="#1E1B4B" />
        <polygon points="32,38 29.5,42 34.5,42" fill="#FBBF24" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="2" />
      <ellipse cx="32" cy="40" rx="16" ry="15" fill="#0F766E" />
      <polygon points="20,24 25,13 32,20 39,13 44,24" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="26" cy="35" r="4.8" fill="#FFFFFF" />
      <circle cx="38" cy="35" r="4.8" fill="#FFFFFF" />
      <circle cx="26" cy="35" r="2.2" fill="#0F172A" />
      <circle cx="38" cy="35" r="2.2" fill="#0F172A" />
      <polygon points="32,38 29.5,42 34.5,42" fill="#F59E0B" />
      <circle cx="14" cy="18" r="2" fill="#F59E0B" />
      <circle cx="50" cy="18" r="2" fill="#F59E0B" />
    </svg>
  );
}

/**
 * 生徒の努力（合格だけでなく、間違えても答案を提出した回数・解いた問題数・メモ記録）を
 * 経験値（XP）として可視化し、キャラクターがレベルアップする成長カード
 */
export function StudentAvatarCard({ studentName, progress }: StudentAvatarCardProps) {
  const attemptsCount = progress.approvals.length;
  const clearedCount = progress.completedStepIds.length;
  const solvedCount = progress.totalSolvedProblems;
  const notesCount = progress.confusionNotes.length;

  // 合格 (+100XP) だけでなく、間違えても提出・挑戦 (+40XP)、解いた問題 (+2XP)、振り返りメモ (+25XP) を加算
  const totalXp =
    clearedCount * 100 +
    attemptsCount * 40 +
    solvedCount * 2 +
    notesCount * 25 +
    progress.streakCount * 15;

  const xpPerLevel = 150;
  const charLevel = Math.floor(totalXp / xpPerLevel) + 1;
  const xpInCurrentLevel = totalXp % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));
  const xpRemaining = xpPerLevel - xpInCurrentLevel;

  const tier =
    [...CHARACTER_TIERS].reverse().find((t) => charLevel >= t.minLevel) ??
    CHARACTER_TIERS[0];

  return (
    <section
      aria-label="がんばりアバターと成長ステータス"
      className={`mb-5 rounded-2xl border border-slate-200/90 bg-gradient-to-r ${tier.accentBg} px-5 py-4 shadow-[0_1px_6px_rgba(15,23,42,0.04)]`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative shrink-0">
          <CharacterAvatarSvg stageKey={tier.stageKey} />
          <span className="absolute -right-1 -bottom-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            Lv.{charLevel}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{studentName}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tier.badgeColor}`}>
              {tier.title}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              累計 {totalXp.toLocaleString()} XP
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/90 ring-1 ring-slate-200/80">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-slate-600">
              次のレベルまであと {xpRemaining} XP
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
            <span>
              答案提出・挑戦 <strong className="text-slate-900">{attemptsCount}</strong> 回
            </span>
            <span>
              合格クリア <strong className="text-slate-900">{clearedCount}</strong> ステップ
            </span>
            <span>
              解いた問題 <strong className="text-slate-900">{solvedCount}</strong> 問
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
