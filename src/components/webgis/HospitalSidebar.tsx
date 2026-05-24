'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart2, Bot, ChevronRight, Hospital, ListChecks, MessageCircle, Send } from 'lucide-react';
import type { Hospital as HospitalType, Message } from '@/types';
import HospitalCard from './HospitalCard';
import StatsCards from './StatsCards';

type SidebarTab = 'stats' | 'hospitals' | 'chat';

interface HospitalSidebarProps {
  activeScenarioId: string | null;
  isLoading: boolean;
  messages: Message[];
  recommendedHospitals: HospitalType[];
  recommendedIds: string[];
  getDistance: (hospitalId: string) => number;
  onClose: () => void;
  onHospitalSelect: (hospital: HospitalType) => void;
  onQuery: (query: string) => void;
}

const suggestions = ['Cempaka Putih', 'Jakarta Selatan', 'Kelapa Gading'];

export default function HospitalSidebar({
  activeScenarioId,
  isLoading,
  messages,
  recommendedHospitals,
  recommendedIds,
  getDistance,
  onClose,
  onHospitalSelect,
  onQuery,
}: HospitalSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('stats');
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (recommendedHospitals.length > 0) setActiveTab('hospitals');
  }, [recommendedHospitals.length]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeTab]);

  function submitQuery(value: string) {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    setActiveTab('chat');
    onQuery(trimmed);
    setInputValue('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuery(inputValue);
  }

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-surface)]">
      <div className="flex h-12 shrink-0 items-center justify-between bg-[#0f172a] px-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Hospital className="h-4 w-4 text-[var(--color-teal)]" />
          Hospital Panel
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Tutup panel"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <TabButton
          icon={<BarChart2 className="h-4 w-4" />}
          label="Stats"
          isActive={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
        />
        <TabButton
          icon={<ListChecks className="h-4 w-4" />}
          label="RS"
          isActive={activeTab === 'hospitals'}
          onClick={() => setActiveTab('hospitals')}
        />
        <TabButton
          icon={<MessageCircle className="h-4 w-4" />}
          label="Chat"
          isActive={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === 'stats' ? <StatsCards /> : null}

        {activeTab === 'hospitals' ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Rekomendasi RS
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {recommendedHospitals.length
                  ? `Skenario aktif: ${activeScenarioId ?? 'simulasi'}`
                  : 'Kirim lokasi pasien dari tab Chat untuk memulai analisis.'}
              </p>
            </div>
            {recommendedHospitals.length ? (
              recommendedHospitals.slice(0, 3).map((hospital, index) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  rank={index + 1}
                  distance={getDistance(hospital.id)}
                  isRecommended={recommendedIds.includes(hospital.id)}
                  onSelect={onHospitalSelect}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-sm text-[var(--color-text-muted)]">
                Belum ada rekomendasi rumah sakit.
              </div>
            )}
          </div>
        ) : null}

        {activeTab === 'chat' ? (
          <div className="flex min-h-full flex-col">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary-glow)] text-[var(--color-primary)]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)]">Asisten AGATA</h3>
                <p className="text-xs text-[var(--color-text-muted)]">GeoAI dispatch support</p>
              </div>
            </div>

            <div className="min-h-[320px] flex-1 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[260px] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                    }`}
                  >
                    <div className="chat-markdown max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-lg bg-[var(--color-surface-2)] px-3 py-2">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-2 w-2 rounded-full bg-[var(--color-teal)]"
                        style={{
                          animation: `typingBounce 0.9s ${dot * 0.12}s infinite ease-in-out`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              <div ref={scrollRef} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] p-4">
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
    </div>
  );
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 border-b-2 px-3 py-3 text-xs font-semibold transition ${
        isActive
          ? 'border-[var(--color-teal)] text-[var(--color-teal)]'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
      }`}
    >
      <span className="flex flex-col items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  );
}
