import { useEffect, useMemo, useState } from 'react';
import { Check, CornerUpLeft, Download, Minus, Plus } from 'lucide-react';
import {
  ALL_MICRO_STEPS,
  getRemediationSteps,
  getStepSummary,
  MICRO_STEPS_BY_STAGE,
  STAGE_GROUPS,
  STAGE_TO_KUMON_RANK,
  type StageGroup,
} from '../lib/contentLoader';
import { buildFeedbackExportLog, type ProgressMap } from '../lib/store';
import type { UserAccount, VariantProblemSet } from '../types/curriculum';

interface TeacherDashboardProps {
  teacher: UserAccount;
  students: UserAccount[];
  progressStore: ProgressMap;
  variantPool: VariantProblemSet[];
  onApproveStep: (
    studentId: string,
    stepId: string,
    accuracyPercent: number,
    comment?: string
  ) => { passed: boolean };
  onAssignStep: (
    studentId: string,
    stepId: string,
    remediationMeta?: { fromTargetStepId: string; lastAccuracy: number }
  ) => void;
  onToggleSelfStudy: (studentId: string, enabled: boolean) => void;
  onBulkToggleSelfStudy: (enabled: boolean) => void;
  onUpdatePassThreshold: (studentId: string, threshold: number) => void;
  onResetDemo: () => void;
}

type TeacherTab = 'grading' | 'history' | 'variants';

export function TeacherDashboard({
  students,
  progressStore,
  variantPool,
  onApproveStep,
  onAssignStep,
  onToggleSelfStudy,
  onBulkToggleSelfStudy,
  onUpdatePassThreshold,
}: TeacherDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<TeacherTab>('grading');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0];
  const selectedProgress = selectedStudent ? progressStore[selectedStudent.id] : undefined;
  const currentSummary = selectedProgress
    ? getStepSummary(selectedProgress.currentStepId)
    : null;

  const [selectedStage, setSelectedStage] = useState<StageGroup>(
    currentSummary?.stage ?? STAGE_GROUPS[0]
  );
  const [assignStepId, setAssignStepId] = useState<string>(
    currentSummary?.id ?? ALL_MICRO_STEPS[0].id
  );
  const currentQuestionCount = currentSummary
    ? ALL_MICRO_STEPS[currentSummary.index]?.questionCount ?? 10
    : 10;
  const [correctCount, setCorrectCount] = useState<number>(currentQuestionCount);
  const [comment, setComment] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const accuracyPercent = Math.round(
    (Math.min(currentQuestionCount, Math.max(0, correctCount)) /
      Math.max(1, currentQuestionCount)) *
      100
  );

  useEffect(() => {
    if (!selectedStudentId && students[0]) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (currentSummary) {
      setSelectedStage(currentSummary.stage);
      setAssignStepId(currentSummary.id);
      const qCount = ALL_MICRO_STEPS[currentSummary.index]?.questionCount ?? 10;
      setCorrectCount(qCount);
    }
  }, [selectedStudentId, selectedProgress?.currentStepId]);

  const stageSteps = useMemo(
    () => MICRO_STEPS_BY_STAGE[selectedStage] ?? [],
    [selectedStage]
  );

  const remediationSteps = useMemo(() => {
    if (!currentSummary) return [];
    const linked = getRemediationSteps(currentSummary.id);
    if (linked.length > 0) return linked;
    if (currentSummary.index > 0) {
      const prev = ALL_MICRO_STEPS[currentSummary.index - 1];
      return [
        {
          id: prev.id,
          stage: prev.stage,
          category: prev.category,
          title: prev.title,
          index: currentSummary.index - 1,
        },
      ];
    }
    return [];
  }, [currentSummary]);

  const latestAttemptOnCurrent = useMemo(() => {
    if (!selectedProgress || !currentSummary) return null;
    return (
      selectedProgress.approvals.find((a) => a.stepId === currentSummary.id) ?? null
    );
  }, [selectedProgress, currentSummary]);

  const threshold = selectedProgress?.passThresholdPercent ?? 90;

  const isCurrentlyFailing =
    accuracyPercent < threshold ||
    (latestAttemptOnCurrent !== null && !latestAttemptOnCurrent.passed);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleStageChange = (stage: StageGroup) => {
    setSelectedStage(stage);
    const first = MICRO_STEPS_BY_STAGE[stage]?.[0];
    if (first) setAssignStepId(first.id);
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !currentSummary) return;
    const { passed } = onApproveStep(
      selectedStudent.id,
      currentSummary.id,
      accuracyPercent,
      comment
    );
    showToast(
      passed
        ? `合格を承認しました（正答率 ${accuracyPercent}%）`
        : `再挑戦（類題出題）を記録しました（正答率 ${accuracyPercent}%）`
    );
    setComment('');
  };

  const handleAssignStep = () => {
    if (!selectedStudent || !assignStepId) return;
    onAssignStep(selectedStudent.id, assignStepId);
    showToast(`${selectedStudent.name} の学習レベルを変更しました`);
  };

  const handleExportLogs = () => {
    const payload = buildFeedbackExportLog(progressStore);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportVariants = () => {
    const blob = new Blob([JSON.stringify(variantPool, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shared-variants-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        {/* Left: Clean Student Directory */}
        <aside className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-bold tracking-wide text-neutral-500">
              生徒一覧（{students.length}）
            </h2>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  onBulkToggleSelfStudy(true);
                  showToast('全員の自習モードを有効にしました');
                }}
                className="font-medium text-blue-700 hover:underline"
              >
                全員自習ON
              </button>
              <span className="text-neutral-300">|</span>
              <button
                type="button"
                onClick={() => {
                  onBulkToggleSelfStudy(false);
                  showToast('全員を通常モードに戻しました');
                }}
                className="font-medium text-neutral-500 hover:underline"
              >
                OFF
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-neutral-400">
              生徒がログインするとここに表示されます。
            </p>
          ) : (
            <div className="space-y-1.5">
              {students.map((stu) => {
                const prog = progressStore[stu.id];
                const isSelected = stu.id === selectedStudent?.id;
                const isSelfStudy = Boolean(prog?.selfStudyEnabled);
                const sum = prog ? getStepSummary(prog.currentStepId) : null;

                return (
                  <div
                    key={stu.id}
                    className={`rounded-xl border p-3 transition ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-transparent hover:bg-neutral-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(stu.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-900">
                          {stu.name}
                        </span>
                        <span className="text-[11px] font-medium text-neutral-400">
                          Lv.{sum ? sum.index + 1 : 1}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {sum ? `${sum.stage}・${sum.title}` : ''}
                      </p>
                    </button>

                    <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2">
                      <span className="text-[11px] text-neutral-500">自習モード</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isSelfStudy}
                        onClick={() => {
                          onToggleSelfStudy(stu.id, !isSelfStudy);
                          showToast(
                            `${stu.name} の自習モードを${!isSelfStudy ? '有効' : '無効'}にしました`
                          );
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                          isSelfStudy ? 'bg-blue-700' : 'bg-neutral-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                            isSelfStudy ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right: Student Control Workspace */}
        <main className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          {!selectedStudent || !selectedProgress || !currentSummary ? (
            <div className="py-16 text-center text-xs text-neutral-400">
              左のリストから生徒を選択してください。
            </div>
          ) : (
            <>
              {/* Student Header + Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5">
                <div>
                  <h1 className="text-lg font-bold text-neutral-900">
                    {selectedStudent.name}
                  </h1>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {selectedStudent.classLabel} ・ Lv.{currentSummary.index + 1}/
                    {ALL_MICRO_STEPS.length}（{currentSummary.stage}・{currentSummary.title}）
                  </p>
                </div>

                <div className="flex rounded-lg bg-neutral-100 p-1 text-xs font-semibold">
                  {(
                    [
                      ['grading', '採点・ステップ設定'],
                      ['history', '履歴・メモ'],
                      ['variants', `類題バンク (${variantPool.length})`],
                    ] as const
                  ).map(([tabKey, label]) => (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setActiveTab(tabKey)}
                      className={`rounded-md px-3 py-1.5 transition ${
                        activeTab === tabKey
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB 1: Grading & 2-Level Cascaded Step Assignment */}
              {activeTab === 'grading' && (
                <div className="mt-6 space-y-8">
                  <section className="space-y-3">
                    <label className="block text-xs font-bold text-neutral-700">
                      学習レベルの指定（全 {ALL_MICRO_STEPS.length} ステップから選択）
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-[180px_1fr_auto]">
                      <select
                        value={selectedStage}
                        onChange={(e) => handleStageChange(e.target.value as StageGroup)}
                        className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-semibold text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                      >
                        {STAGE_GROUPS.map((st) => (
                          <option key={st} value={st}>
                            {st} ({MICRO_STEPS_BY_STAGE[st].length})
                          </option>
                        ))}
                      </select>

                      <select
                        value={assignStepId}
                        onChange={(e) => setAssignStepId(e.target.value)}
                        className="min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                      >
                        {stageSteps.map((step) => (
                          <option key={step.id} value={step.id}>
                            [{step.category}] {step.title}（{step.questionCount}問）
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleAssignStep}
                        className="rounded-xl border border-neutral-900 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                      >
                        設定する
                      </button>
                    </div>
                  </section>

                  {/* Face-to-Face Approval Form */}
                  <form
                    onSubmit={handleApprove}
                    className="space-y-5 border-t border-neutral-100 pt-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-neutral-900">
                        ノート確認・採点登録
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-neutral-500">合格基準</span>
                        {[80, 90, 100].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => onUpdatePassThreshold(selectedStudent.id, v)}
                            className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                              threshold === v
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {v}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700">
                          正解数：{correctCount} / 全{currentQuestionCount}問（正答率{' '}
                          {accuracyPercent}%）
                        </label>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                            <button
                              type="button"
                              onClick={() => setCorrectCount((c) => Math.max(0, c - 1))}
                              className="rounded-lg p-1.5 text-neutral-700 transition hover:bg-white"
                              aria-label="正解数を1減らす"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={currentQuestionCount}
                              value={correctCount}
                              onChange={(e) =>
                                setCorrectCount(
                                  Math.min(
                                    currentQuestionCount,
                                    Math.max(0, Number(e.target.value))
                                  )
                                )
                              }
                              className="w-12 bg-transparent text-center text-sm font-bold text-neutral-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setCorrectCount((c) => Math.min(currentQuestionCount, c + 1))
                              }
                              className="rounded-lg p-1.5 text-neutral-700 transition hover:bg-white"
                              aria-label="正解数を1増やす"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {[
                              { label: '全問正解', val: currentQuestionCount },
                              { label: '1問ミス', val: Math.max(0, currentQuestionCount - 1) },
                              { label: '2問ミス', val: Math.max(0, currentQuestionCount - 2) },
                              { label: '半分', val: Math.floor(currentQuestionCount / 2) },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setCorrectCount(preset.val)}
                                className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                                  correctCount === preset.val
                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700">
                          コメント（任意・生徒画面の上部に表示されます）
                        </label>
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="途中式が丁寧でした"
                          className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-neutral-500">
                        {accuracyPercent >= threshold
                          ? '合格として次のレベルへ進みます'
                          : `${threshold}%未満のため同問題数の類題へ切り替わります`}
                      </span>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-800"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>
                          {accuracyPercent >= threshold ? '合格を承認する' : '再挑戦を記録する'}
                        </span>
                      </button>
                    </div>
                  </form>

                  {/* Diagnostic Remediation Links (不合格時はおすすめレベルを強調提示！) */}
                  {remediationSteps.length > 0 && (
                    <section
                      className={`space-y-2.5 rounded-xl border p-4 transition ${
                        isCurrentlyFailing
                          ? 'border-amber-300 bg-amber-50/70'
                          : 'border-neutral-200 bg-neutral-50/60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3
                          className={`text-xs font-bold ${
                            isCurrentlyFailing ? 'text-amber-900' : 'text-neutral-700'
                          }`}
                        >
                          {isCurrentlyFailing
                            ? '不合格のためのおすすめ戻りレベル（前提単元へ戻して基礎を固める）'
                            : 'つまずき時の戻り学習リンク（前提単元）'}
                        </h3>
                        <span className="text-[11px] text-neutral-500">
                          {STAGE_TO_KUMON_RANK[currentSummary.stage]}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {remediationSteps.map((rem, idx) => (
                          <button
                            key={rem.id}
                            type="button"
                            onClick={() => {
                              onAssignStep(selectedStudent.id, rem.id, {
                                fromTargetStepId: currentSummary.id,
                                lastAccuracy:
                                  latestAttemptOnCurrent?.accuracyPercent ?? accuracyPercent,
                              });
                              showToast(
                                `${selectedStudent.name} を戻り学習（${rem.stage}・${rem.title}）に設定しました（効果測定を開始）`
                              );
                            }}
                            className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${
                              idx === 0 && isCurrentlyFailing
                                ? 'border-amber-400 bg-white shadow-xs hover:bg-amber-50/50'
                                : 'border-neutral-200 bg-white hover:border-amber-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                                {idx === 0 && isCurrentlyFailing && (
                                  <span className="rounded bg-amber-600 px-1.5 py-0.5 text-[10px] text-white">
                                    第1おすすめ
                                  </span>
                                )}
                                <span>
                                  {rem.stage}（Lv.{rem.index + 1}）
                                </span>
                              </div>
                              <div className="mt-0.5 truncate font-semibold text-neutral-800">
                                {rem.title}
                              </div>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                              <CornerUpLeft className="h-3 w-3" />
                              戻す
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* TAB 2: History & Notes */}
              {activeTab === 'history' && (
                <div className="mt-6 space-y-6">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleExportLogs}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>学習ログJSON出力</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-neutral-500">採点履歴</h3>
                    {selectedProgress.approvals.length === 0 ? (
                      <p className="mt-2 text-xs text-neutral-400">履歴はありません。</p>
                    ) : (
                      <div className="mt-2 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                        {selectedProgress.approvals.map((app) => {
                          const s = getStepSummary(app.stepId);
                          return (
                            <div
                              key={app.id}
                              className="flex items-center justify-between px-4 py-3 text-xs"
                            >
                              <div>
                                <span className="font-semibold text-neutral-900">
                                  {s.title}
                                </span>
                                <span className="ml-2 text-neutral-400">
                                  {app.mode === 'self-study' ? '自習採点' : '教員採点'}
                                </span>
                              </div>
                              <span
                                className={`font-bold ${
                                  app.passed ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {app.passed ? '合格' : '再挑戦'} {app.accuracyPercent}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-neutral-500">
                      戻り学習の相関・効果ログ（週次アップデート用データ）
                    </h3>
                    {(selectedProgress.remediationOutcomes?.length ?? 0) === 0 ? (
                      <p className="mt-2 text-xs text-neutral-400">
                        まだ戻り学習の効果測定データはありません（戻り学習後に元の単元へ再挑戦すると自動記録されます）。
                      </p>
                    ) : (
                      <div className="mt-2 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                        {selectedProgress.remediationOutcomes?.map((rec) => {
                          const targetS = getStepSummary(rec.targetStepId);
                          const remS = getStepSummary(rec.remediationStepId);
                          return (
                            <div
                              key={rec.id}
                              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs"
                            >
                              <div>
                                <span className="font-semibold text-neutral-900">
                                  {targetS.title}
                                </span>
                                <span className="mx-1.5 text-neutral-400">←</span>
                                <span className="text-neutral-600">{remS.title}</span>
                              </div>
                              <span
                                className={`font-bold ${
                                  rec.passedAfter ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {rec.accuracyBefore}% → {rec.accuracyAfter}%（
                                {rec.accuracyGain >= 0 ? `+${rec.accuracyGain}` : rec.accuracyGain}%・
                                {rec.passedAfter ? '回復合格' : '再検討要'}）
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-neutral-500">質問・つまずきメモ</h3>
                    {selectedProgress.confusionNotes.length === 0 ? (
                      <p className="mt-2 text-xs text-neutral-400">メモはありません。</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {selectedProgress.confusionNotes.map((n) => (
                          <div
                            key={n.id}
                            className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-700"
                          >
                            <span className="mr-2 font-mono text-[11px] text-neutral-400">
                              {n.stepId}
                            </span>
                            {n.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Shared Variant Bank */}
              {activeTab === 'variants' && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                      生成された類題は保存され、別生徒の再挑戦時にも自動再利用されます。
                    </p>
                    <button
                      type="button"
                      onClick={handleExportVariants}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>JSON出力</span>
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                    {variantPool.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-neutral-400">
                        まだ類題は生成されていません。
                      </p>
                    ) : (
                      variantPool.map((v) => {
                        const s = getStepSummary(v.stepId);
                        return (
                          <div
                            key={v.id}
                            className="flex items-center justify-between px-4 py-3 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-neutral-900">
                                {s.title}
                              </span>
                              <span className="ml-2 text-neutral-400">
                                類題 {v.variantNumber}（全{v.questionCount}問）
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-500">
                              {v.createdBy === 'gemini' ? 'AI生成' : '自動生成'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed right-6 bottom-6 z-40 rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white shadow-md">
          {toast}
        </div>
      )}
    </div>
  );
}
