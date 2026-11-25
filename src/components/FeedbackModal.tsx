import { useState } from 'react';
import { CheckCircle2, Loader2, MessageSquarePlus, X } from 'lucide-react';
import { saveAppFeedbackToFirestore } from '../lib/firestoreSync';
import type { UserAccount } from '../types/curriculum';

interface FeedbackModalProps {
  user: UserAccount;
  currentStepId?: string;
  currentStepTitle?: string;
  onClose: () => void;
}

const CATEGORIES = [
  '問題のミス・解説のズレ',
  '使いにくい・デザイン改善',
  'ほしい機能・要望',
  'その他',
] as const;

export function FeedbackModal({
  user,
  currentStepId,
  currentStepTitle,
  onClose,
}: FeedbackModalProps) {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    try {
      await saveAppFeedbackToFirestore({
        id: `fb-${Date.now()}`,
        userId: user.id,
        userRole: user.role,
        category,
        message: message.trim(),
        stepId: currentStepId || '',
        stepTitle: currentStepTitle || '',
        createdAt: new Date().toISOString(),
        status: 'open',
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="アプリへのご意見・不具合報告"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">
              アプリへのご意見・不具合報告
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
            <p className="mt-3 text-sm font-bold text-slate-900">
              ご意見を送信しました！
            </p>
            <p className="mt-1 text-xs text-slate-500">
              いただいた内容は自動で集計され、次回の教材・アプリ改善アップデートに反映されます。
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800"
            >
              学習に戻る
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-xs leading-relaxed text-slate-500">
              気づいたこと（解説のズレ、問題の誤り、使いにくい点など）をそのまま送ってください。自動的に改善アップデートへ活用されます。
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700">種類</label>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg border px-2.5 py-2 text-left text-[11px] font-semibold transition ${
                      category === cat
                        ? 'border-teal-700 bg-teal-50 text-teal-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">内容</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="例：このステップの例題がもう少し詳しいとわかりやすい、など"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none"
              />
            </div>

            {currentStepTitle && (
              <p className="text-[11px] text-slate-400">
                ※ 現在のステップ「{currentStepTitle}」の情報が自動で添付されます。
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white transition hover:bg-teal-800 disabled:opacity-40"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>送信する</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
