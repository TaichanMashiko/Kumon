import { useEffect, useState } from 'react';
import { Check, Download } from 'lucide-react';
import { getOrderedStepIds } from '../lib/contentLoader';
import { buildFeedbackExportLog, type ProgressMap } from '../lib/store';
import type { StepDocument, UserAccount, VariantProblemSet } from '../types/curriculum';

interface TeacherDashboardProps {
  teacher: UserAccount;
  students: UserAccount[];
  stepsById: Record<string, StepDocument>;
  progressStore: ProgressMap;
  variantPool: VariantProblemSet[];
  onApproveStep: (
    studentId: string,
    stepId: string,
    accuracyPercent: number,
    comment?: string
  ) => { passed: boolean };
  onAssignStep: (studentId: string, stepId: string) => void;
  onToggleSelfStudy: (studentId: string, enabled: boolean) => void;
  onBulkToggleSelfStudy: (enabled: boolean) => void;
  onUpdatePassThreshold: (studentId: string, threshold: number) => void;
  onResetDemo: () => void;
}

type TeacherTab = 'grading' | 'history' | 'variants';

export function TeacherDashboard({
  students,
  stepsById,
  progressStore,
  variantPool,
  onApproveStep,
  onAssignStep,
  onToggleSelfStudy,
  onBulkToggleSelfStudy,
  onUpdatePassThreshold,
}: TeacherDashboardProps) {
  const orderedStepIds = getOrderedStepIds();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<TeacherTab>('grading');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0];
  const selectedProgress = selectedStudent ? progressStore[selectedStudent.id] : undefined;

  const [assignStepId, setAssignStepId] = useState<string>(
    selectedProgress?.currentStepId ?? orderedStepIds[0] ?? ''
  );
  const [accuracyPercent, setAccuracyPercent] = useState<number>(90);
  const [comment, setComment] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedStudentId && students[0]) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (selectedProgress?.currentStepId) {
      setAssignStepId(selectedProgress.currentStepId);
    }
  }, [selectedProgress?.currentStepId, selectedStudentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedProgress) return;
    const { passed } = onApproveStep(
      selectedStudent.id,
      selectedProgress.currentStepId,
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
    showToast(`${selectedStudent.name} の学習内容を更新しました`);
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

  const threshold = selectedProgress?.passThresholdPercent ?? 90;

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
                const currentStep = prog ? stepsById[prog.currentStepId] : undefined;

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
                          {prog?.completedStepIds.length ?? 0}/{orderedStepIds.length}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {currentStep?.frontmatter.title ?? prog?.currentStepId}
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
          {!selectedStudent || !selectedProgress ? (
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
                    {selectedStudent.classLabel} ・ 現在:{' '}
                    <span className="font-semibold text-neutral-800">
                      {stepsById[selectedProgress.currentStepId]?.frontmatter.title ??
                        selectedProgress.currentStepId}
                    </span>
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

              {/* TAB 1: Grading & Step Assignment */}
              {activeTab === 'grading' && (
                <div className="mt-6 space-y-8">
                  {/* Step Assignment by Teacher */}
                  <section className="space-y-2.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      学習ステップの指定（生徒画面に表示する教材）
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      <select
                        value={assignStepId}
                        onChange={(e) => setAssignStepId(e.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                      >
                        {orderedStepIds.map((id, idx) => (
                          <option key={id} value={id}>
                            ステップ {idx + 1}：{stepsById[id]?.frontmatter.stage} —{' '}
                            {stepsById[id]?.frontmatter.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssignStep}
                        className="rounded-xl border border-neutral-900 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                      >
                        この内容に設定
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
                          正答率：{accuracyPercent}%
                        </label>
                        <div className="mt-2 flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={accuracyPercent}
                            onChange={(e) => setAccuracyPercent(Number(e.target.value))}
                            className="flex-1 accent-neutral-900"
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={accuracyPercent}
                            onChange={(e) =>
                              setAccuracyPercent(
                                Math.min(100, Math.max(0, Number(e.target.value)))
                              )
                            }
                            className="w-16 rounded-lg border border-neutral-200 px-2 py-1.5 text-center text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700">
                          コメント（任意）
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
                          ? '合格として次のステップへ進みます'
                          : `${threshold}%未満のため同問題数の類題へ切り替わります`}
                      </span>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>
                          {accuracyPercent >= threshold ? '合格を承認する' : '再挑戦を記録する'}
                        </span>
                      </button>
                    </div>
                  </form>
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
                        {selectedProgress.approvals.map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between px-4 py-3 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-neutral-900">
                                {stepsById[app.stepId]?.frontmatter.title ?? app.stepId}
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
                        ))}
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
                    {variantPool.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between px-4 py-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-neutral-900">
                            {stepsById[v.stepId]?.frontmatter.title ?? v.stepId}
                          </span>
                          <span className="ml-2 text-neutral-400">
                            類題 {v.variantNumber}（全{v.questionCount}問）
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          {v.createdBy === 'gemini' ? 'AI生成' : '標準'}
                        </span>
                      </div>
                    ))}
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
