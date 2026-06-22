import { Bot, Download, Loader2, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import api from "../../lib/api";

const suggestedPrompts = [
  "Show churn insights",
  "Best customer segments",
  "Revenue growth analysis",
  "High-value customer recommendations",
  "Customer retention suggestions",
  "Explain CLV trends",
];

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  message: "Hi, I am your Segmify.ai assistant. Ask me about churn, revenue, CLV, segments, reports, or customer recommendations.",
  created_at: new Date().toISOString(),
};

export default function AIAssistantPanel({ open, onClose }) {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const hasConversation = useMemo(() => messages.some((item) => item.id !== "welcome"), [messages]);

  useEffect(() => {
    if (!open) return;
    let ignore = false;

    async function loadHistory() {
      setHistoryLoading(true);
      setError("");
      try {
        const { data } = await api.get("/ai/history");
        if (ignore) return;
        setSessionId(data.session_id);
        setMessages(data.messages?.length ? data.messages : [welcomeMessage]);
      } catch (err) {
        if (!ignore) {
          console.error("AI history load failed", err);
          setError(err.response?.data?.detail || "Unable to load AI assistant history.");
        }
      } finally {
        if (!ignore) setHistoryLoading(false);
      }
    }

    loadHistory();
    return () => {
      ignore = true;
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const optimisticMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      message: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current.filter((item) => item.id !== "welcome"), optimisticMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: trimmed, session_id: sessionId });
      setSessionId(data.session_id);
      setMessages(data.messages);
    } catch (err) {
      console.error("AI chat failed", err);
      setError(err.response?.data?.detail || "Unable to generate an AI response. Please try again.");
      setMessages((current) => current.filter((item) => item.id !== optimisticMessage.id));
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    setError("");
    try {
      await api.delete("/ai/history");
      setSessionId(null);
      setMessages([welcomeMessage]);
    } catch (err) {
      console.error("AI history clear failed", err);
      setError(err.response?.data?.detail || "Unable to clear chat history.");
    }
  }

  function exportChat() {
    const text = messages.map((item) => `${item.role.toUpperCase()} (${formatTime(item.created_at)}):\n${item.message}`).join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "segmify-ai-chat.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-x-3 bottom-3 top-3 ml-auto flex max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-soft md:inset-x-auto md:right-6 md:w-[520px]">
        <div className="border-b border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent">
                <Bot size={22} />
              </div>
              <div>
                <p className="font-display text-xl">AI Assistant</p>
                <p className="mt-1 text-sm text-slate-400">Segmentation, churn, CLV, reports, and recommendations</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-2xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={clearHistory} disabled={!hasConversation} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
              <RotateCcw size={14} /> Clear
            </button>
            <button onClick={exportChat} disabled={!hasConversation} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {historyLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 className="animate-spin" size={18} /> Loading assistant history...
            </div>
          ) : (
            messages.map((item) => <ChatBubble key={item.id} message={item} />)
          )}
          {loading && (
            <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <Sparkles size={16} className="text-brand-100" />
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-200" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-200 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-200 [animation-delay:240ms]" />
              </span>
              Thinking through your analytics...
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-slate-900/80 p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} onClick={() => sendMessage(prompt)} disabled={loading} className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-brand-300/50 hover:bg-brand-500/10 disabled:opacity-50">
                {prompt}
              </button>
            ))}
          </div>
          {error && <p className="mb-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows="1"
              className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300"
              placeholder="Ask about churn, revenue, CLV, segments..."
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-3xl px-4 py-3 ${isUser ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-slate-100"}`}>
        <div className="prose prose-invert max-w-none text-sm leading-7 prose-p:my-1 prose-ul:my-2 prose-li:my-1">
          {renderMarkdown(message.message)}
        </div>
        <p className={`mt-2 text-[11px] ${isUser ? "text-slate-500" : "text-slate-500"}`}>{formatTime(message.created_at)}</p>
      </div>
    </div>
  );
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    if (line.startsWith("### ")) {
      return <h3 key={index} className="mb-2 mt-1 font-display text-lg text-white">{line.replace("### ", "")}</h3>;
    }
    if (line.startsWith("- ")) {
      return <p key={index} className="pl-2">{formatInline(line)}</p>;
    }
    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }
    return <p key={index}>{formatInline(line)}</p>;
  });
}

function formatInline(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
