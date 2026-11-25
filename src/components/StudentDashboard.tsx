import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Loader2, Minus, PenLine, Plus } from 'lucide-react';
import {
  ALL_MICRO_STEPS,
  getStepDocument,
  resolveStepId,
} from '../lib/contentLoader';
import { getOrGenerateVariantSet } from '../lib/variantStore';
import type {
  StudentProgress,
  UserAccount,
  VariantProblemSet,
} from '../types/curriculum';
import { AiTutorPanel } from './AiTutorPanel';
import { MarkdownMath } from './MarkdownMath';

interface StudentDashboardProps {
  user: UserAccount;
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

function extractExplanationOnly(markdown: string): string {
  const idx = markdown.indexOf('# ✍️ 練習問題');
  if (idx === -1) return markdown;
  return markdown.slice(0, idx).trim();
}

export function StudentDashboard({
  progress,
  onRateClarity,
  onAddConfusionNote,
  onSelfGradeSubmit,
  onSelectVariantNumber,
  onVariantPoolChanged,
}: StudentDashboardProps) {
  const resolvedStepId = resolveStepId(progress.currentStepId);
  const activeStep = useMemo(() => getStepDocument(resolvedStepId, 0), [resolvedStepId]);
  const activeStepId = activeStep.frontmatter.id;
  const stepIndex = Math.max(
    0,
    ALL_MICRO_STEPS.findIndex((s) => s.id === activeStepId)
  );
  const totalSteps = ALL_MICRO_STEPS.length;
  const questionCount = activeStep.frontmatter.question_count ?? 15;
  const passThreshold = progress.passThresholdPercent ?? 90;

  const [correctCount, setCorrectCount] = useState<number>(questionCount);
  const [lastResult, setLastResult] = useState<{
    passed: boolean;
    accuracy: number;
    hasNext: boolean;
  } | null>(null);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const activeVariantNum = progress.activeVariantByStep[activeStepId] ?? 0;
  const [loadedVariant, setLoadedVariant] = useState<VariantProblemSet | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    setCorrectCount(questionCount);
    setLastResult(null);
    setVariantError(null);
    setShowNoteForm(false);
  }, [activeStepId, questionCount]);

  useEffect(() => {
    let cancelled = false;
    if (activeVariantNum <= 0) {
      setLoadedVariant(null);
      setVariantError(null);
      return;
    }

    setVariantLoading(true);
    setVariantError(null);
    getOrGenerateVariantSet(activeStep, activeVariantNum)
      .then(({ variant }) => {
        if (cancelled) return;
        setLoadedVariant(variant);
        onVariantPoolChanged?.();
      })
      .catch((err) => {
        if (cancelled) return;
        setVariantError(
          err instanceof Error ? err.message : '類題の準備に失敗しました。'
        );
      })
      .finally(() => {
        if (!cancelled) setVariantLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeStep, activeVariantNum, onVariantPoolChanged]);

  const currentRating = progress.clarityRatings[activeStepId]?.score;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleSelfGrade = () => {
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
      hasNext: Boolean(result.nextStepId),
    });
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddConfusionNote(activeStepId, noteInput);
    setNoteInput('');
    setShowNoteForm(false);
    showToast('メモを記録しました');
  };

  const displayMarkdown =
    activeVariantNum > 0 && loadedVariant
      ? `${extractExplanationOnly(activeStep.body)}\n\n---\n\n${loadedVariant.markdown}`
      : activeStep.body;

  const progressRatio = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0;
  const currentAccuracy = Math.round((correctCount / questionCount) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-24 sm:px-6">
      {/* Subtle Step Progress Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="font-semibold text-neutral-900">
            レベル {stepIndex + 1} / {totalSteps}
          </span>
          <span className="text-neutral-300">・</span>
          <span>{activeStep.frontmatter.stage}</span>
          <span className="text-neutral-300">・</span>
          <span>{activeStep.frontmatter.category}</span>
          {activeVariantNum > 0 && (
            <>
              <span className="text-neutral-300">・</span>
              <span className="rounded bg-neutral-200/80 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                類題 {activeVariantNum}
              </span>
            </>
          )}
        </div>

        <div className="hidden h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-neutral-200 sm:block">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all duration-300"
            style={{ width: `${progressRatio}%` }}
          />
        </div>
      </div>

      {/* Main Study Sheet */}
      <article className="rounded-2xl border border-neutral-200/90 bg-white px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:px-11 sm:py-10">
        <header className="mb-8 border-b border-neutral-100 pb-6">
          <p className="text-xs font-medium text-neutral-400">
            {activeStep.frontmatter.stage} ／ {activeStep.frontmatter.category}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-neutral-900">
            {activeStep.frontmatter.title}
          </h1>
        </header>

        {variantLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-xs text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-700" />
            <span>類題を準備しています...</span>
          </div>
        ) : variantError ? (
          <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <p>{variantError}</p>
            <button
              type="button"
              onClick={() => onSelectVariantNumber(activeStepId, 0)}
              className="font-semibold underline"
            >
              元の問題を表示する
            </button>
          </div>
        ) : (
          <MarkdownMath content={displayMarkdown} />
        )}

        {/* Bottom Grading Area */}
        <div className="mt-10 border-t border-neutral-200 pt-7">
          {progress.selfStudyEnabled ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-900">
                  自己採点（正答率 {passThreshold}% 以上で次のレベルへ）
                </span>
                <span className="text-sm font-bold text-neutral-900">
                  {correctCount} / {questionCount} 問正解（{currentAccuracy}%）
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                  <button
                    type="button"
                    onClick={() => setCorrectCount((c) => Math.max(0, c - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 hover:bg-white"
                    aria-label="1問減らす"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={questionCount}
                    value={correctCount}
                    onChange={(e) =>
                      setCorrectCount(
                        Math.min(questionCount, Math.max(0, Number(e.target.value)))
                      )
                    }
                    className="w-14 bg-transparent text-center text-sm font-bold text-neutral-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCorrectCount((c) => Math.min(questionCount, c + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 hover:bg-white"
                    aria-label="1問増やす"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {[
                  { label: '全問正解', val: questionCount },
                  { label: '1問ミス', val: Math.max(0, questionCount - 1) },
                  { label: '2問ミス', val: Math.max(0, questionCount - 2) },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCorrectCount(preset.val)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      correctCount === preset.val
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSelfGrade}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>採点する</span>
                </button>

                {lastResult && !lastResult.passed && (
                  <p className="text-xs text-amber-700">
                    正答率 {lastResult.accuracy}%（基準 {passThreshold}%）— 同問題数の類題に切り替わりました。
                  </p>
                )}

                {lastResult && lastResult.passed && !lastResult.hasNext && (
                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <ArrowRight className="h-3.5 w-3.5" />
                    全レベルを完了しました。
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              解き終わったら、自己採点したノートを先生に見せてください。
            </p>
          )}
        </div>
      </article>

      {/* Minimal Footer Feedback Strip */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span>わかりやすさ</span>
          <div className="flex items-center gap-1">
            {([1, 2, 3, 4, 5] as const).map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => {
                  onRateClarity(activeStepId, score);
                  showToast('評価を記録しました');
                }}
                className={`h-7 w-7 rounded-md text-xs font-semibold transition ${
                  currentRating === score
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNoteForm((v) => !v)}
          className="inline-flex items-center gap-1.5 font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          <PenLine className="h-3.5 w-3.5" />
          <span>メモを残す</span>
        </button>
      </div>

      {showNoteForm && (
        <form
          onSubmit={handleNoteSubmit}
          className="mt-3 flex gap-2 rounded-xl border border-neutral-200 bg-white p-3"
        >
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="つまずいた箇所を一言で記録..."
            className="flex-1 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!noteInput.trim()}
            className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            保存
          </button>
        </form>
      )}

      {/* Dedicated Floating AI Question Button & Drawer */}
      <AiTutorPanel
        key={activeStepId}
        step={activeStep}
        onLogConfusionNote={(note) => onAddConfusionNote(activeStepId, note)}
      />

      {toast && (
        <div className="fixed bottom-6 left-6 z-40 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white shadow-md">
          {toast}
        </div>
      )}
    </div>
  );
}
