import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  Lock,
  RotateCcw,
  Unlock,
  Users,
} from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';
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
  onToggleSelfStudy: (studentId: string, enabled: boolean) => void;
  onBulkToggleSelfStudy: (enabled: boolean) => void;
  onUpdatePassThreshold: (studentId: string, threshold: number) => void;
  onResetDemo: () => void;
}

export function TeacherDashboard({
  students,
  stepsById,
  progressStore,
  variantPool,
  onApproveStep,
  onToggleSelfStudy,
  onBulkToggleSelfStudy,
  onUpdatePassThreshold,
  onResetDemo,
}: TeacherDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id ?? '');
  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0];
  const selectedProgress = selectedStudent ? progressStore[selectedStudent.id] : undefined;

  useEffect(() => {
    if (!selectedStudentId && students[0]) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  const [targetStepId, setTargetStepId] = useState<string>(
    selectedProgress?.currentStepId ?? Object.keys(stepsById)[0] ?? ''
  );
  const [accuracyPercent, setAccuracyPercent] = useState<number>(90);
  const [comment, setComment] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const prog = progressStore[studentId];
    if (prog) {
      setTargetStepId(prog.currentStepId);
    }
    setAccuracyPercent(90);
    setComment('');
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !targetStepId) return;
    const { passed } = onApproveStep(
      selectedStudent.id,
      targetStepId,
      accuracyPercent,
      comment
    );
    if (passed) {
      showToast(
        `${selectedStudent.name} さんの ${targetStepId} を合格承認（正答率 ${accuracyPercent}%）しました`
      );
    } else {
      showToast(
        `${selectedStudent.name} さんは ${accuracyPercent}%（基準未満）のため再挑戦（類題セット）に切り替えました`
      );
    }
    setComment('');
  };

  const handleExportJson = () => {
    const payload = buildFeedbackExportLog(progressStore);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('定期パッチ用学習ログJSONをエクスポートしました');
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
    showToast('共有類題バンクJSONをエクスポートしました');
  };

  const allStepIds = Object.keys(stepsById);
  const threshold = selectedProgress?.passThresholdPercent ?? 90;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            教員用 進度承認・自習モード管理画面
          </h1>
          <p className="text-xs text-slate-500">
            アカウントごとの自習モード開放（冬休み等）、90%合格承認、共有類題バンクを一元管理します。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onBulkToggleSelfStudy(true);
              showToast('全生徒の自習モード（自己採点）を一括開放しました');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Unlock className="h-3.5 w-3.5" />
            全員の自習モードON
          </button>
          <button
            type="button"
            onClick={() => {
              onBulkToggleSelfStudy(false);
              showToast('全生徒を通常モード（教員採点のみ）に戻しました');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Lock className="h-3.5 w-3.5" />
            全員OFF
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Download className="h-3.5 w-3.5" />
            学習ログJSON出力
          </button>
          {!isFirebaseConfigured && (
            <button
              type="button"
              onClick={() => {
                onResetDemo();
                showToast('デモデータを初期状態に戻しました');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              初期化
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Student List with Per-Account Self-Study Toggle */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Users className="h-4 w-4 text-blue-600" />
            生徒一覧・自習モード管理
          </div>

          <div className="space-y-2.5">
            {students.map((stu) => {
              const prog = progressStore[stu.id];
              const isSelected = stu.id === selectedStudent?.id;
              const currentStep = prog ? stepsById[prog.currentStepId] : undefined;
              const noteCount = prog?.confusionNotes.length ?? 0;
              const isSelfStudy = Boolean(prog?.selfStudyEnabled);

              return (
                <div
                  key={stu.id}
                  className={`rounded-xl border p-3.5 transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectStudent(stu.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {stu.initials}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{stu.name}</div>
                          <div className="text-[11px] text-slate-500">{stu.classLabel}</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        {prog?.completedStepIds.length ?? 0}/{allStepIds.length} 合格
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs">
                      <span className="font-mono font-semibold text-blue-700">
                        現在: {prog?.currentStepId}
                      </span>
                      {noteCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          <AlertTriangle className="h-3 w-3" />
                          メモ {noteCount}
                        </span>
                      )}
                    </div>
                    {currentStep && (
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">
                        {currentStep.frontmatter.title}
                      </div>
                    )}
                  </button>

                  {/* Per-Account Self-Study Mode Toggle */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[11px] font-semibold text-slate-600">
                      自習モード（自己採点）
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSelfStudy(stu.id, !isSelfStudy);
                        showToast(
                          `${stu.name} さんの自習モードを ${!isSelfStudy ? '開放(ON)' : '停止(OFF)'} にしました`
                        );
                      }}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        isSelfStudy
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isSelfStudy ? (
                        <>
                          <Unlock className="h-3 w-3" />
                          開放中 ON
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          通常 OFF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Detail Panel */}
        {selectedStudent && selectedProgress && (
          <main className="space-y-6">
            {/* Approval Form Card */}
            <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedStudent.name} さんの進度承認・合格ライン設定
                    </h2>
                    <p className="text-xs text-slate-500">
                      現在ステップ: <strong className="font-mono">{selectedProgress.currentStepId}</strong>
                      {' '}・ 合格基準: <strong>{threshold}%以上</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">合格基準:</span>
                  {[80, 90, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        onUpdatePassThreshold(selectedStudent.id, val);
                        showToast(`${selectedStudent.name} さんの合格基準を ${val}% に変更しました`);
                      }}
                      className={`rounded-lg px-2.5 py-1 font-bold transition ${
                        threshold === val
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleApproveSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    採点するステップ
                  </label>
                  <select
                    value={targetStepId}
                    onChange={(e) => setTargetStepId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {allStepIds.map((id) => (
                      <option key={id} value={id}>
                        {id} — {stepsById[id]?.frontmatter.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    正答率（%）：{' '}
                    <span
                      className={`text-base ${
                        accuracyPercent >= threshold ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {accuracyPercent}%
                    </span>
                  </label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={accuracyPercent}
                      onChange={(e) => setAccuracyPercent(Number(e.target.value))}
                      className="flex-1 accent-emerald-600"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={accuracyPercent}
                      onChange={(e) =>
                        setAccuracyPercent(Math.min(100, Math.max(0, Number(e.target.value))))
                      }
                      className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center text-sm font-bold text-slate-900"
                    />
                  </div>
                  {accuracyPercent < threshold && (
                    <p className="mt-1 text-[11px] font-medium text-amber-700">
                      ※ {threshold}%未満のため次へ進まず、同問題数の類題セットが自動出題されます。
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">
                    教員メモ（任意）
                  </label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="例：dxからdtの書き換えが丁寧にできていた"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end sm:col-span-2">
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition ${
                      accuracyPercent >= threshold
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {accuracyPercent >= threshold
                      ? `合格（${threshold}%以上）を承認して次へ進める`
                      : `再挑戦を記録して類題を出題する`}
                  </button>
                </div>
              </form>
            </section>

            {/* Student Confusion Notes & Approval History */}
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">
                  生徒の躓きメモ・AI質問ログ
                </h3>
                {selectedProgress.confusionNotes.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-400">
                    記録された躓きメモはありません。
                  </p>
                ) : (
                  <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                    {selectedProgress.confusionNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs"
                      >
                        <div className="font-mono text-[11px] font-bold text-amber-800">
                          {note.stepId}
                        </div>
                        <div className="mt-1 text-slate-800">{note.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">採点・合格履歴</h3>
                {selectedProgress.approvals.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-400">まだ採点履歴がありません。</p>
                ) : (
                  <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                    {selectedProgress.approvals.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-800">
                              {app.stepId}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                app.mode === 'self-study'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {app.mode === 'self-study' ? '自習採点' : '教員採点'}
                            </span>
                          </div>
                          {app.comment && (
                            <div className="mt-0.5 text-slate-600">{app.comment}</div>
                          )}
                          <div className="mt-1 text-[10px] text-slate-400">
                            {app.approvedBy}
                          </div>
                        </div>
                        <span
                          className={`rounded-lg px-2.5 py-1 font-bold ${
                            app.passed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.passed ? '合格' : '再挑戦'} {app.accuracyPercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Shared Variant Bank Panel */}
            <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    全生徒共有 類題データバンク（{variantPool.length}セット蓄積済み）
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleExportVariants}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800 hover:bg-purple-100"
                >
                  <Download className="h-3.5 w-3.5" />
                  類題バンクJSON出力
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                一度Geminiで生成された類題は自動保存され、別の生徒が同じレベルを再挑戦する際にAPIコストゼロで再利用されます。
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {variantPool.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-900">
                        {v.stepId} #{v.variantNumber}
                      </span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
                        {v.createdBy === 'gemini' ? 'Gemini生成' : 'プリセット'}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      問題数: {v.questionCount}問
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}
      </div>

      {toast && (
        <div className="fixed right-5 bottom-5 z-30 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
