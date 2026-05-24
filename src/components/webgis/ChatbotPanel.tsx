'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, UserRound } from 'lucide-react';
import type { Message } from '@/types';

interface ChatbotPanelProps {
  messages: Message[];
  isLoading: boolean;
  onQuery: (query: string) => void;
}

const suggestions = ['Cempaka Putih', 'Jakarta Selatan', 'Kelapa Gading'];

export default function ChatbotPanel({ messages, isLoading, onQuery }: ChatbotPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function submitQuery(value: string) {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onQuery(trimmed);
    setInputValue('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuery(inputValue);
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary-glow)] text-[var(--color-primary)]">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text)]">Asisten AGATA</h2>
            <p className="text-xs text-[var(--color-text-muted)]">GeoAI dispatch support</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser ? (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-teal)]">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              ) : null}
              <div
                className={`max-w-[240px] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                }`}
              >
                <div className="chat-markdown max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.hospitals?.length ? (
                  <div className="mt-3 space-y-1 border-t border-white/10 pt-2 text-xs text-[var(--color-text-muted)]">
                    {message.hospitals.map((hospital, index) => (
                      <div key={hospital.id} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {index + 1}. {hospital.name}
                        </span>
                        <span className="shrink-0">{hospital.available_beds} bed</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              {isUser ? (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                  <UserRound className="h-3.5 w-3.5" />
                </div>
              ) : null}
            </div>
          );
        })}

        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-teal)]">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-[var(--color-surface-2)] px-3 py-2">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-2 w-2 rounded-full bg-[var(--color-teal)]"
                  style={{ animation: `typingBounce 0.9s ${dot * 0.12}s infinite ease-in-out` }}
                />
              ))}
            </div>
          </div>
        ) : null}
        <div ref={scrollRef} />
      </div>

      <div className="border-t border-[var(--color-border)] p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInputValue(suggestion)}
              className="rounded-full border border-teal-400/40 px-3 py-1 text-xs font-medium text-teal-200 transition hover:bg-teal-400/10"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Masukkan lokasi pasien..."
            className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-faint)] focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Kirim"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
