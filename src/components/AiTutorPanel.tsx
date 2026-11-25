import { useState } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import type { AiChatMessage, StepDocument } from '../types/curriculum';
import { MarkdownMath } from './MarkdownMath';

interface AiTutorPanelProps {
  step: StepDocument;
  onLogConfusionNote?: (text: string) => void;
}

const QUICK_PROMPTS = [
  'この単元のポイントをわかりやすく教えて',
  '1問目のヒントだけ教えて',
  '途中の式変形がわからない',
];

export function AiTutorPanel({ step, onLogConfusionNote }: AiTutorPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const studentMsg: AiChatMessage = {
      id: `msg-s-${Date.now()}`,
      role: 'student',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    if (onLogConfusionNote) {
      onLogConfusionNote(`[質問] ${trimmed}`);
    }

    try {
      const res = await fetch('/api/ask-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.frontmatter.id,
          stepTitle: step.frontmatter.title,
          stage: step.frontmatter.stage,
          stepMarkdown: step.body,
          question: trimmed,
          history: messages,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || '回答の取得に失敗しました。');
      }

      const tutorMsg: AiChatMessage = {
        id: `msg-t-${Date.now()}`,
        role: 'tutor',
        text: data.answer,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '通信エラーが発生しました。もう一度お試しください。'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-6 bottom-6 z-40 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-neutral-800 active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" />
          <span>AIに質問する</span>
        </button>
      )}

      {/* Slide-over Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]">
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="AIに質問する"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">AIに質問する</h2>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {step.frontmatter.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="space-y-3 pt-4">
                  <p className="text-xs leading-relaxed text-neutral-500">
                    わからない箇所を入力してください。解き方のヒントを段階的にお伝えします。
                  </p>
                  <div className="flex flex-col gap-2">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        disabled={loading}
                        onClick={() => askQuestion(q)}
                        className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-left text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'student'
                      ? 'ml-10 bg-neutral-900 text-white'
                      : 'mr-6 border border-neutral-200 bg-neutral-50 text-neutral-800'
                  }`}
                >
                  {msg.role === 'student' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownMath content={msg.text} />
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>考えています...</span>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                askQuestion(input);
              }}
              className="flex items-center gap-2 border-t border-neutral-200 p-4"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="質問を入力..."
                disabled={loading}
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-800 disabled:opacity-40"
                aria-label="送信"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
