import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minus,
  PenLine,
  Plus,
} from 'lucide-react';
import {
  ALL_MICRO_STEPS,
  getStepDocument,
  getWorksheetData,
  resolveStepId,
} from '../lib/contentLoader';
import { getOrGenerateVariantSet } from '../lib/variantStore';
import type { StudentProgress, UserAccount } from '../types/curriculum';
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

export function StudentDashboard({
  progress,
  onRateClarity,
  onAddConfusionNote,
  onSelfGradeSubmit,
  onVariantPoolChanged,
}: StudentDashboardProps) {
  const resolvedStepId = resolveStepId(progress.currentStepId);
  const activeStep = useMemo(() => getStepDocument(resolvedStepId, 0), [resolvedStepId]);
  const activeStepId = activeStep.frontmatter.id;
  const activeVariantNum = progress.activeVariantByStep[activeStepId] ?? 0;

  // Structured worksheet (explanation + 2-column problems & answers)
  const worksheet = useMemo(
    () => getWorksheetData(activeStepId, activeVariantNum),
    [activeStepId, activeVariantNum]
  );

  const stepIndex = Math.max(
    0,
    ALL_MICRO_STEPS.findIndex((s) => s.id === activeStepId)
  );
  const totalSteps = ALL_MICRO_STEPS.length;
  const questionCount = worksheet.questionCount;
  const passThreshold = progress.passThresholdPercent ?? 90;

  // UI toggles (explanation & answers hidden by default!)
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  // Self-grading & confirmation modal state
  const [correctCount, setCorrectCount] = useState<number>(questionCount);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transitionBanner, setTransitionBanner] = useState<{
    kind: 'pass' | 'retry';
    message: string;
  } | null>(null);

  // Minimal feedback note state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Sync variant to shared Firestore pool in background when activeVariantNum > 0
  useEffect(() => {
    if (activeVariantNum > 0) {
      void getOrGenerateVariantSet(activeStep, activeVariantNum).then(() => {
        onVariantPoolChanged?.();
      });
    }
  }, [activeStep, activeVariantNum, onVariantPoolChanged]);

  // Reset per-sheet UI when step or variant changes
  useEffect(() => {
    setCorrectCount(questionCount);
    setShowExplanation(false);
    setShowAnswers(false);
    setConfirmOpen(false);
    setShowNoteForm(false);
  }, [activeStepId, activeVariantNum, questionCount]);

  const currentRating = progress.clarityRatings[activeStepId]?.score;
  const currentAccuracy = Math.round((correctCount / questionCount) * 100);
  const willPass = currentAccuracy >= passThreshold;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleConfirmGrade = () => {
    const prevLevel = stepIndex + 1;
    const prevTitle = activeStep.frontmatter.title;
    const accuracy = Math.round((correctCount / questionCount) * 100);
    const variantId = activeVariantNum > 0 ? `${activeStepId}-v${activeVariantNum}` : undefined;

    const result = onSelfGradeSubmit(activeStepId, correctCount, questionCount, variantId);
    setConfirmOpen(false);

    if (result.passed) {
      setTransitionBanner({
        kind: 'pass',
        message: result.nextStepId
          ? `レベル ${prevLevel}「${prevTitle}」に合格（${accuracy}%）しました！新しいレベルへ進みました。`
          : `全レベルを完了しました（正答率 ${accuracy}%）！`,
      });
    } else {
      setTransitionBanner({
        kind: 'retry',
        message: `正答率 ${accuracy}%（合格基準 ${passThreshold}%）でした。同じレベルの類題（全${questionCount}問）に切り替わりました。`,
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddConfusionNote(activeStepId, noteInput);
    setNoteInput('');
    setShowNoteForm(false);
    showToast('メモを記録しました');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-24 sm:px-6">
      {/* Transition Notification Banner (Prevents missing worksheet switches!) */}
      {transitionBanner && (
        <div
          className={`mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-semibold shadow-xs ${
            transitionBanner.kind === 'pass'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{transitionBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setTransitionBanner(null)}
            className="shrink-0 text-[11px] underline opacity-75 hover:opacity-100"
          >
            閉じる
          </button>
        </div>
      )}

      {/* Workbook Sheet Container */}
      <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
        {/* Friendly Educational Workbook Header */}
        <header className="border-b border-teal-100 bg-gradient-to-r from-teal-50/90 via-emerald-50/40 to-white px-6 py-5 sm:px-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal-700 px-2.5 py-1 text-xs font-bold text-white">
                レベル {stepIndex + 1}
              </span>
              <span className="text-xs font-semibold text-teal-900/70">
                {activeStep.frontmatter.stage} ／ {activeStep.frontmatter.category}
              </span>
              {activeVariantNum > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  類題 #{activeVariantNum}
                </span>
              )}
            </div>

            <span className="text-xs font-medium text-slate-500">
              全 {questionCount} 問 ・ 進度 {stepIndex + 1} / {totalSteps}
            </span>
          </div>

          <h1 className="mt-2.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {activeStep.frontmatter.title}
          </h1>
        </header>

        <div className="px-6 py-6 sm:px-9 sm:py-8">
          {/* Collapsible Explanation (Hidden by Default!) */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowExplanation((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-2 text-xs font-bold text-teal-900 transition hover:bg-teal-100/70"
            >
              <BookOpen className="h-3.5 w-3.5 text-teal-700" />
              <span>{showExplanation ? '解説を閉じる' : '解き方の解説を見る'}</span>
              {showExplanation ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showExplanation && (
              <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/40 px-5 py-4 text-sm leading-relaxed text-slate-800">
                <MarkdownMath content={worksheet.explanation} />
              </div>
            )}
          </div>

          {/* 2-Column Printed Drill Grid (Compact, Easy to Read) */}
          <section aria-label="練習問題">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                手元のノートに鉛筆で解きましょう
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {worksheet.problems.map((prob, idx) => (
                <div
                  key={`${activeStepId}-${activeVariantNum}-${idx}`}
                  className="flex items-baseline gap-3 rounded-xl border border-slate-200/80 bg-[#FAFBFA] px-4 py-3.5 transition hover:border-teal-300/70"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                    {idx + 1}
                  </span>
                  <div className="math-inline min-w-0 flex-1 overflow-x-auto text-[15px] text-slate-900">
                    <MarkdownMath content={prob.prompt} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Collapsible 2-Column Answers Grid */}
          <section className="mt-7 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setShowAnswers((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
            >
              {showAnswers ? (
                <EyeOff className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <Eye className="h-3.5 w-3.5 text-teal-700" />
              )}
              <span>
                {showAnswers ? '解答を隠す' : '解き終わったらここを押して答え合わせ'}
              </span>
            </button>

            {showAnswers && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="mb-3 text-xs font-bold text-slate-600">
                  解答（自己採点用）
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {worksheet.problems.map((prob, idx) => (
                    <div
                      key={`ans-${idx}`}
                      className="flex items-baseline gap-2.5 rounded-lg bg-white px-3 py-2 text-sm text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    >
                      <span className="shrink-0 font-mono text-xs font-bold text-teal-700">
                        ({idx + 1})
                      </span>
                      <div className="math-inline min-w-0 flex-1 overflow-x-auto">
                        <MarkdownMath content={prob.answer} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Bottom Self-Grading Area */}
          <section className="mt-8 border-t border-slate-200 pt-6">
            {progress.selfStudyEnabled ? (
              <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-teal-950">
                    自己採点（正答率 {passThreshold}% 以上で次のレベルへ）
                  </span>
                  <span className="text-sm font-bold text-teal-900">
                    {correctCount} / {questionCount} 問正解（{currentAccuracy}%）
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setCorrectCount((c) => Math.max(0, c - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
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
                      className="w-14 bg-transparent text-center text-sm font-bold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCorrectCount((c) => Math.min(questionCount, c + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
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
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-800"
                  >
                    <Check className="h-4 w-4" />
                    <span>採点結果を送信する</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs font-medium text-slate-500">
                解き終わったら、答え合わせをしたノートを先生に見せてください。
              </p>
            )}
          </section>
        </div>
      </article>

      {/* Subtle Footer Feedback Strip */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-500">
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
                    ? 'bg-teal-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-400'
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
          className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition hover:text-slate-900"
        >
          <PenLine className="h-3.5 w-3.5" />
          <span>メモを残す</span>
        </button>
      </div>

      {showNoteForm && (
        <form
          onSubmit={handleNoteSubmit}
          className="mt-3 flex gap-2 rounded-xl border border-slate-200 bg-white p-3"
        >
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="つまずいた箇所を一言で記録..."
            className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!noteInput.trim()}
            className="rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            保存
          </button>
        </form>
      )}

      {/* Confirmation Modal Before Submitting Grade */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="採点結果の送信確認"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">
              この採点結果を送信しますか？
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              レベル {stepIndex + 1}：{activeStep.frontmatter.title}
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-xs text-slate-500">あなたの採点結果</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {correctCount} / {questionCount} 問正解
                <span className="ml-2 text-lg text-teal-700">（{currentAccuracy}%）</span>
              </div>
              <p
                className={`mt-2 text-xs font-semibold ${
                  willPass ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {willPass
                  ? `合格です！送信すると次のレベル（レベル ${stepIndex + 2}）へ進みます。`
                  : `${passThreshold}%未満のため、送信すると同じレベルの類題（全${questionCount}問）に切り替わります。`}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                戻って確認する
              </button>
              <button
                type="button"
                onClick={handleConfirmGrade}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-800"
              >
                この結果で送信する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Question Button & Drawer */}
      <AiTutorPanel
        key={activeStepId}
        step={activeStep}
        onLogConfusionNote={(note) => onAddConfusionNote(activeStepId, note)}
      />

      {toast && (
        <div className="fixed bottom-6 left-6 z-40 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-md">
          {toast}
        </div>
      )}
    </div>
  );
}
