import { useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import type { AiChatMessage, StepDocument } from '../types/curriculum';
import { MarkdownMath } from './MarkdownMath';

interface AiTutorPanelProps {
  step: StepDocument;
  onLogConfusionNote?: (text: string) => void;
}

const QUICK_PROMPTS = [
  'この単元のポイントを小学生でもわかるように教えて',
  '1問目の最初のヒントだけ教えて',
  '途中式の変形がなぜそうなるか教えて',
];

export function AiTutorPanel({ step, onLogConfusionNote }: AiTutorPanelProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveNote, setAutoSaveNote] = useState(true);

  const askQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const studentMsg: AiChatMessage = {
      id: `msg-s-${Date.now()}`,
      role: 'student',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextHistory = [...messages, studentMsg];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    if (autoSaveNote && onLogConfusionNote) {
      onLogConfusionNote(`[AI質問] ${trimmed}`);
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
        throw new Error(data.error || `AI質問APIエラー (HTTP ${res.status})`);
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
          : 'AI先生への接続に失敗しました。Vercelの GEMINI_API_KEY 設定を確認してください。'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              AI先生に質問する
              <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                <Sparkles className="h-2.5 w-2.5" />
                AIチューター
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              わからない場所を聞くと、答えを丸投げせずスモールステップのヒントで導きます。
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-600">
          <input
            type="checkbox"
            checked={autoSaveNote}
            onChange={(e) => setAutoSaveNote(e.target.checked)}
            className="rounded accent-indigo-600"
          />
          質問を躓きメモにも記録
        </label>
      </div>

      {/* Quick Prompts */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => askQuestion(q)}
            className="rounded-full border border-indigo-200 bg-indigo-50/50 px-3 py-1 text-[11px] font-medium text-indigo-800 transition hover:bg-indigo-100 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat History */}
      {messages.length > 0 && (
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl p-3 text-sm ${
                msg.role === 'student'
                  ? 'ml-8 bg-indigo-600 text-white'
                  : 'mr-4 border border-slate-200 bg-white text-slate-800'
              }`}
            >
              <div
                className={`mb-1 text-[10px] font-bold ${
                  msg.role === 'student' ? 'text-indigo-200' : 'text-indigo-600'
                }`}
              >
                {msg.role === 'student' ? 'あなたの質問' : 'AI先生（ヒント）'}
              </div>
              {msg.role === 'student' ? (
                <p className="whitespace-pre-wrap text-xs">{msg.text}</p>
              ) : (
                <div className="text-xs">
                  <MarkdownMath content={msg.text} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI先生がヒントを考えています...
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          askQuestion(input);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例：なぜ 2x dx が dt に変わるの？"
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          質問する
        </button>
      </form>
    </section>
  );
}
