import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  CircleDot,
  Flame,
  Loader2,
  Lock,
  MessageSquarePlus,
  NotebookPen,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  Trophy,
  Unlock,
} from 'lucide-react';
import { curriculumMap, getStudentRankInfo } from '../lib/contentLoader';
import { getOrGenerateVariantSet } from '../lib/variantStore';
import type {
  StepDocument,
  StudentProgress,
  UserAccount,
  VariantProblemSet,
} from '../types/curriculum';
import { AiTutorPanel } from './AiTutorPanel';
import { MarkdownMath } from './MarkdownMath';

interface StudentDashboardProps {
  user: UserAccount;
  stepsById: Record<string, StepDocument>;
  progress: StudentProgress;
  onRateClarity: (stepId: string, score: 1 | 2 | 3 | 4 | 5) => void;
  onAddConfusionNote: (stepId: string, note: string) => void;
  onSelfGradeSubmit: (
    stepId: string,
    correctCount: number,
    totalCount: number,
    variantId?: string
  ) => { passed: boolean; nextStepId: string | null };
  onSelectVariantNumber: (stepId: string, variantNumber: number) => void;
  onVariantPoolChanged?: () => void;
}

const CLARITY_OPTIONS: Array<{ score: 1 | 2 | 3 | 4 | 5; label: string; short: string }> = [
  { score: 5, label: 'よくわかった', short: '5' },
  { score: 4, label: 'わかった', short: '4' },
  { score: 3, label: 'ふつう', short: '3' },
  { score: 2, label: '少し難しい', short: '2' },
  { score: 1, label: 'わからない', short: '1' },
];

function extractExplanationOnly(markdown: string): string {
  const idx = markdown.indexOf('# ✍️ 練習問題');
  if (idx === -1) return markdown;
  return markdown.slice(0, idx).trim();
}

export function StudentDashboard({
  user,
  stepsById,
  progress,
  onRateClarity,
  onAddConfusionNote,
  onSelfGradeSubmit,
  onSelectVariantNumber,
  onVariantPoolChanged,
}: StudentDashboardProps) {
  const [selectedStepId, setSelectedStepId] = useState<string>(progress.currentStepId);
  const [noteInput, setNoteInput] = useState('');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Self-study grading state
  const activeStep = stepsById[selectedStepId] ?? Object.values(stepsById)[0];
  const activeStepId = activeStep?.frontmatter.id ?? '';
  const questionCount = activeStep?.frontmatter.question_count ?? 4;
  const [correctCount, setCorrectCount] = useState<number>(questionCount);
  const [lastResult, setLastResult] = useState<{
    passed: boolean;
    accuracy: number;
    nextStepId: string | null;
  } | null>(null);

  // Variant problem state (same question count on retry)
  const activeVariantNum = progress.activeVariantByStep[activeStepId] ?? 0;
  const [loadedVariant, setLoadedVariant] = useState<VariantProblemSet | null>(null);
  const [variantSource, setVariantSource] = useState<string | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    setCorrectCount(questionCount);
    setLastResult(null);
    setVariantError(null);
  }, [activeStepId, questionCount]);

  useEffect(() => {
    let cancelled = false;
    if (!activeStep || activeVariantNum <= 0) {
      setLoadedVariant(null);
      setVariantSource(null);
      setVariantError(null);
      return;
    }

    setVariantLoading(true);
    setVariantError(null);
    getOrGenerateVariantSet(activeStep, activeVariantNum)
      .then(({ variant, source }) => {
        if (cancelled) return;
        setLoadedVariant(variant);
        setVariantSource(
          source === 'gemini'
            ? 'Gemini APIで新規生成 → 全生徒共有プールに保存済み'
            : '共有類題プールから再利用（APIコストゼロ）'
        );
        onVariantPoolChanged?.();
      })
      .catch((err) => {
        if (cancelled) return;
        setVariantError(
          err instanceof Error ? err.message : '類題の読み込みに失敗しました'
        );
      })
      .finally(() => {
        if (!cancelled) setVariantLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeStep, activeVariantNum, onVariantPoolChanged]);

  const completedSet = new Set(progress.completedStepIds);
  const rankInfo = getStudentRankInfo(progress.completedStepIds);
  const passThreshold = progress.passThresholdPercent ?? 90;

  const currentRating = activeStep
    ? progress.clarityRatings[activeStepId]?.score
    : undefined;
  const stepNotes = activeStep
    ? progress.confusionNotes.filter((n) => n.stepId === activeStepId)
    : [];

  const isStepUnlocked = (stepId: string, prerequisites: string[]): boolean => {
    if (completedSet.has(stepId) || progress.currentStepId === stepId) return true;
    return prerequisites.every((pre) => completedSet.has(pre));
  };

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3200);
  };

  const handleRating = (score: 1 | 2 | 3 | 4 | 5) => {
    if (!activeStep) return;
    onRateClarity(activeStepId, score);
    showToast(`解説評価「${score}」を保存しました`);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStep || !noteInput.trim()) return;
    onAddConfusionNote(activeStepId, noteInput);
    setNoteInput('');
    showToast('躓きメモを保存しました');
  };

  const handleSelfGrade = () => {
    if (!activeStep) return;
    const accuracy = Math.round((correctCount / questionCount) * 100);
    const result = onSelfGradeSubmit(
      activeStepId,
      correctCount,
      questionCount,
      loadedVariant?.id
    );
    setLastResult({
      passed: result.passed,
      accuracy,
      nextStepId: result.nextStepId,
    });
    if (result.passed) {
      showToast(`🎉 正答率 ${accuracy}% で合格！次のステップが解放されました！`);
    } else {
      showToast(
        `正答率 ${accuracy}%（合格基準 ${passThreshold}%）。同問題数の類題で再挑戦します！`
      );
    }
  };

  const handleRequestNextVariant = () => {
    if (!activeStep) return;
    onSelectVariantNumber(activeStepId, activeVariantNum + 1);
    setLastResult(null);
  };

  const displayMarkdown =
    activeStep && activeVariantNum > 0 && loadedVariant
      ? `${extractExplanationOnly(activeStep.body)}\n\n---\n\n${loadedVariant.markdown}`
      : activeStep?.body ?? '';

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
      {/* Growth & Mastery Banner (Elementary -> University Entrance) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {user.name}：{rankInfo.label}
                </span>
                {progress.selfStudyEnabled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    <Unlock className="h-3 w-3" />
                    自習モード開放中（自己採点OK・{passThreshold}%以上で次へ）
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    <Lock className="h-3 w-3" />
                    通常モード（教員の対面採点で次へ）
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100 sm:w-64">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${rankInfo.progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  小学→大学受験 達成率 {rankInfo.progressPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 font-bold text-orange-700">
              <Flame className="h-4 w-4 text-orange-500" />
              {progress.streakCount} 連続合格
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-700">
              <Award className="h-4 w-4 text-blue-600" />
              累計 {progress.totalSolvedProblems} 問演習
            </div>
          </div>
        </div>

        {/* Spaced Review Reminder */}
        {progress.reviewQueueStepIds.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
              <RotateCcw className="h-3.5 w-3.5" />
              要リベンジ・復習ステップ:
            </span>
            {progress.reviewQueueStepIds.map((rid) => (
              <button
                key={rid}
                type="button"
                onClick={() => setSelectedStepId(rid)}
                className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-900 hover:bg-amber-100"
              >
                {rid} に再挑戦
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Sidebar: Curriculum Step Tree */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">一貫カリキュラム</h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {progress.completedStepIds.length} / {Object.keys(stepsById).length} 合格
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              正答率 {passThreshold}% 以上で次のステップが自動解放されます。
            </p>

            <div className="mt-4 space-y-5">
              {curriculumMap.units.map((unit) => {
                const sortedSteps = [...unit.steps].sort((a, b) => a.order - b.order);
                return (
                  <div key={unit.unit_id}>
                    <div className="mb-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        {unit.stage} ・ {unit.category}
                      </div>
                      <div className="text-xs font-bold text-slate-900">{unit.title}</div>
                    </div>

                    <div className="space-y-1.5">
                      {sortedSteps.map((node) => {
                        const isDone = completedSet.has(node.id);
                        const isCurrent = progress.currentStepId === node.id;
                        const unlocked = isStepUnlocked(node.id, node.prerequisites);
                        const isSelected = activeStepId === node.id;

                        return (
                          <button
                            key={node.id}
                            type="button"
                            disabled={!unlocked}
                            onClick={() => setSelectedStepId(node.id)}
                            className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                                : unlocked
                                ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                : 'cursor-not-allowed border-slate-100 bg-slate-50/70 opacity-60'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : isCurrent ? (
                                <CircleDot className="h-4 w-4 text-blue-600" />
                              ) : unlocked ? (
                                <CircleDot className="h-4 w-4 text-slate-400" />
                              ) : (
                                <Lock className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-[11px] font-semibold text-slate-500">
                                  {node.id}
                                </span>
                                {node.is_auxiliary && (
                                  <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    補助
                                  </span>
                                )}
                                {isCurrent && !isDone && (
                                  <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    学習中
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 text-xs font-semibold text-slate-800">
                                {node.title}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analog Self-Study Reminder */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold">
              <NotebookPen className="h-4 w-4 text-amber-700" />
              完全習得ルール（公文式）
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-amber-900/90">
              <li>解説を読み、わからなければ<strong>AI先生に質問</strong></li>
              <li>練習問題を<strong>手元のノートに鉛筆で解く</strong></li>
              <li>解答を開いて自己採点（<strong>{passThreshold}%以上で合格</strong>）</li>
              <li>{passThreshold}%未満なら<strong>同問題数の類題</strong>で即リベンジ！</li>
            </ol>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {activeStep && (
            <>
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                        {activeStepId}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {activeStep.frontmatter.stage} / {activeStep.frontmatter.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        全{questionCount}問 ・ v{activeStep.frontmatter.version}
                      </span>
                      {activeVariantNum > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">
                          <RefreshCw className="h-3 w-3" />
                          類題セット #{activeVariantNum}
                        </span>
                      )}
                    </div>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">
                      {activeStep.frontmatter.title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeVariantNum > 0 && (
                      <button
                        type="button"
                        onClick={() => onSelectVariantNumber(activeStepId, 0)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        元の問題に戻す
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={variantLoading}
                      onClick={handleRequestNextVariant}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800 transition hover:bg-purple-100 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${variantLoading ? 'animate-spin' : ''}`} />
                      同じレベルの類題（{questionCount}問）に挑戦
                    </button>
                  </div>
                </div>

                {variantSource && activeVariantNum > 0 && (
                  <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50/70 px-3.5 py-2 text-xs font-medium text-purple-900">
                    ✨ 類題セット #{activeVariantNum} を表示中（{variantSource}）
                  </div>
                )}

                {variantLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-slate-600">
                    <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
                    <p className="font-semibold">
                      同問題数（{questionCount}問）の類題を共有プール確認／生成中...
                    </p>
                  </div>
                ) : variantError ? (
                  <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                    <p className="font-bold">類題の生成に失敗しました：{variantError}</p>
                    <button
                      type="button"
                      onClick={() => onSelectVariantNumber(activeStepId, 0)}
                      className="rounded-lg bg-white px-3 py-1.5 font-semibold text-rose-700 shadow-xs"
                    >
                      オリジナル問題を表示する
                    </button>
                  </div>
                ) : (
                  <MarkdownMath content={displayMarkdown} />
                )}
              </article>

              {/* Self-Study Mode Grading Card OR Normal Mode Banner */}
              {progress.selfStudyEnabled ? (
                <section className="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        自習モード：自己採点＆合格判定（{passThreshold}%以上で次へ）
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        上の解答を開いてノートを◯付けしたら、正解した問題数を選んで判定してください。
                      </p>
                    </div>
                    <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-800">
                      正答率: {Math.round((correctCount / questionCount) * 100)}%（{correctCount} / {questionCount} 問）
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {Array.from({ length: questionCount + 1 }, (_, i) => i).map((num) => {
                      const pct = Math.round((num / questionCount) * 100);
                      const isSelected = correctCount === num;
                      const meetsPass = pct >= passThreshold;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCorrectCount(num)}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                            isSelected
                              ? meetsPass
                                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                : 'border-amber-500 bg-amber-500 text-white shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {num}問正解 ({pct}%)
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleSelfGrade}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      自己採点を記録して判定する
                    </button>

                    {lastResult && lastResult.passed && lastResult.nextStepId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStepId(lastResult.nextStepId!);
                          setLastResult(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
                      >
                        次のステップ ({lastResult.nextStepId}) へガンガン進む
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {lastResult && (
                    <div
                      className={`mt-4 rounded-xl border p-4 text-xs font-semibold ${
                        lastResult.passed
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-amber-200 bg-amber-50 text-amber-900'
                      }`}
                    >
                      {lastResult.passed ? (
                        <div>
                          🎉 素晴らしい！正答率 {lastResult.accuracy}%（基準 {passThreshold}% 以上）で完全習得クリアです！
                        </div>
                      ) : (
                        <div>
                          💪 正答率 {lastResult.accuracy}% でした。{passThreshold}% 以上で次のステップに進めます。
                          同問題数（{questionCount}問）の類題を自動で用意したので、もう一度リベンジしよう！
                        </div>
                      )}
                    </div>
                  )}
                </section>
              ) : (
                <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 text-xs text-blue-950">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                    <NotebookPen className="h-4 w-4 text-blue-600" />
                    通常モード（対面確認）で学習中
                  </div>
                  <p className="mt-1 text-blue-900/80">
                    自己採点が終わったら、手元のノートを持って先生のところへ行きましょう。先生が正答率（{passThreshold}%以上）を確認して次のステップを解放します。
                    ※ 冬休みなどの自習モードは教員画面からアカウントごとに開放できます。
                  </p>
                </section>
              )}

              {/* Gemini AI Tutor Panel */}
              <AiTutorPanel
                key={activeStepId}
                step={activeStep}
                onLogConfusionNote={(note) => onAddConfusionNote(activeStepId, note)}
              />

              {/* Feedback Panel: Clarity Rating + Confusion Note */}
              <section className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                    この解説のわかりやすさ評価
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    評価が低いステップは、週末の自動パッチで図解や途中式が補強されます。
                  </p>

                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {CLARITY_OPTIONS.map((opt) => {
                      const selected = currentRating === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleRating(opt.score)}
                          className={`flex flex-col items-center justify-center rounded-xl border px-1.5 py-2.5 text-center transition ${
                            selected
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <span className="text-base font-bold">{opt.short}</span>
                          <span
                            className={`mt-0.5 text-[10px] leading-tight ${
                              selected ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <MessageSquarePlus className="h-4 w-4 text-amber-600" />
                    躓きメモ（わからなかった箇所）
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    「どこで止まったか」を一言残すと、次回の教材改訂で補足が追加されます。
                  </p>

                  <form onSubmit={handleNoteSubmit} className="mt-3 space-y-2.5">
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows={2}
                      placeholder="例：tに置いた後のdxからdtへの変換が分からない"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!noteInput.trim()}
                        className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        躓きメモを保存
                      </button>
                    </div>
                  </form>

                  {stepNotes.length > 0 && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="text-[11px] font-semibold text-slate-500">
                        このステップで記録したメモ（{stepNotes.length}件）
                      </div>
                      {stepNotes.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950"
                        >
                          {n.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {savedToast && (
        <div className="fixed right-5 bottom-5 z-30 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          {savedToast}
        </div>
      )}
    </div>
  );
}
