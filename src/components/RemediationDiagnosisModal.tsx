import { useState } from 'react';
import { CornerUpLeft, Loader2, Sparkles } from 'lucide-react';

export interface RemediationCandidate {
  id: string;
  stage: string;
  category: string;
  title: string;
  index: number;
}

interface RemediationDiagnosisModalProps {
  currentStepTitle: string;
  currentStepStage: string;
  failCount: number;
  candidates: RemediationCandidate[];
  onAcceptRemediation: (stepId: string, reasonText: string) => void;
  onStayOnCurrent: (reasonText?: string) => void;
}

const SYMPTOM_OPTIONS = [
  '途中の計算（分数・符号・展開など）でミスをしてしまう',
  '公式や解き方の手順があいまいになっている',
  '問題の最初の一歩（式の立て方・置き換え）がわからない',
  '時間がかかりすぎて最後まで集中が続かない',
];

export function RemediationDiagnosisModal({
  currentStepTitle,
  currentStepStage,
  failCount,
  candidates,
  onAcceptRemediation,
  onStayOnCurrent,
}: RemediationDiagnosisModalProps) {
  const [selectedSymptom, setSelectedSymptom] = useState<string>(SYMPTOM_OPTIONS[0]);
  const [freeText, setFreeText] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<{
    recommendedStep: RemediationCandidate;
    explanation: string;
  } | null>(null);

  const combinedReason = [selectedSymptom, freeText.trim()].filter(Boolean).join(' ／ ');

  const handleDiagnose = async () => {
    if (candidates.length === 0) return;
    setDiagnosing(true);
    try {
      const res = await fetch('/api/diagnose-remediation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: {
            stage: currentStepStage,
            title: currentStepTitle,
          },
          studentReason: combinedReason,
          candidates,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const matched =
        candidates.find((c) => c.id === data.recommendedStepId) ?? candidates[0];
      setDiagnosis({
        recommendedStep: matched,
        explanation:
          data.explanation ||
          `まずは土台となる「${matched.title}」を90%以上でクリアしてから戻ると、このレベルもスムーズに解けるようになります。`,
      });
    } catch {
      const fallback = candidates[0];
      setDiagnosis({
        recommendedStep: fallback,
        explanation: `まずは土台となる「${fallback.title}」を復習してから、もう一度このレベルに挑戦しましょう。`,
      });
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="つまずき診断と戻り学習の提案"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-700">
          <Sparkles className="h-4 w-4" />
          <span>つまずき診断（{failCount}回連続で90%未満）</span>
        </div>

        <h2 className="mt-1.5 text-lg font-bold text-slate-900">
          どこがいちばん難しく感じましたか？
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          同じレベルで何度も止まるときは、1つ前の土台を復習する方が結果的に早く合格できます。つまずいた理由を教えてください。
        </p>

        {!diagnosis ? (
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              {SYMPTOM_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition ${
                    selectedSymptom === opt
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="symptom"
                    checked={selectedSymptom === opt}
                    onChange={() => setSelectedSymptom(opt)}
                    className="accent-teal-700"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                具体的にわからないところがあれば書いてください（任意）
              </label>
              <input
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="例：分数の通分で迷う、移項の符号を間違える など"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => onStayOnCurrent(freeText.trim() || undefined)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                このまま同じレベルの類題を解く
              </button>
              <button
                type="button"
                disabled={diagnosing}
                onClick={handleDiagnose}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-800 disabled:opacity-50"
              >
                {diagnosing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>おすすめの戻りレベルを診断する</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
              <div className="text-[11px] font-bold text-teal-800">
                おすすめの戻り学習レベル
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                レベル {diagnosis.recommendedStep.index + 1}：{diagnosis.recommendedStep.title}
              </div>
              <div className="text-xs text-slate-500">
                {diagnosis.recommendedStep.stage} ／ {diagnosis.recommendedStep.category}
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-700">
                {diagnosis.explanation}
              </p>
              <p className="mt-2 text-[11px] text-teal-900/80">
                ※ この基礎レベルを90%以上でクリアすると、自動的に元のレベルへ戻ります。
              </p>
            </div>

            {candidates.length > 1 && (
              <div>
                <div className="mb-1.5 text-[11px] font-semibold text-slate-500">
                  別の戻り先を選ぶ場合：
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidates
                    .filter((c) => c.id !== diagnosis.recommendedStep.id)
                    .map((alt) => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() =>
                          setDiagnosis({
                            recommendedStep: alt,
                            explanation: `「${alt.title}」から復習して、土台をしっかり固めてから元のレベルへ戻りましょう。`,
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:border-teal-400"
                      >
                        Lv.{alt.index + 1} {alt.title}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => onStayOnCurrent(combinedReason)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                元のレベルで再挑戦する
              </button>
              <button
                type="button"
                onClick={() =>
                  onAcceptRemediation(diagnosis.recommendedStep.id, combinedReason)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-800"
              >
                <CornerUpLeft className="h-3.5 w-3.5" />
                <span>この基礎レベルに戻って復習する</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
