'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart2, Bot, ChevronLeft, Hospital, ListChecks, MessageCircle, Send } from 'lucide-react';
import type { Hospital as HospitalType, Message } from '@/types';
import HospitalCard from './HospitalCard';
import StatsCards from './StatsCards';

type SidebarTab = 'stats' | 'hospitals' | 'chat';

interface HospitalSidebarProps {
  activeScenarioId: string | null;
  isLoading: boolean;
  messages: Message[];
  recommendedHospitals: HospitalType[];
  visibleHospitals: HospitalType[];
  recommendedIds: number[];
  getDistance: (hospital: HospitalType) => number;
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
  visibleHospitals,
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

  const hasRecommendations = recommendedHospitals.length > 0;
  const displayedHospitals = hasRecommendations
    ? recommendedHospitals.slice(0, 3)
    : visibleHospitals.slice(0, 10);

  return (
    <div className="flex h-full w-full flex-col bg-navy text-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
          <Hospital className="h-4 w-4 shrink-0 text-teal" />
          <span className="truncate">Hospital Panel</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white"
          aria-label="Tutup panel"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="shrink-0 space-y-1 border-b border-white/10 p-3">
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

      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {activeTab === 'stats' ? <StatsCards /> : null}

        {activeTab === 'hospitals' ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {hasRecommendations ? 'Rekomendasi RS' : 'RS Terfilter'}
              </h3>
              <p className="mt-1 text-xs text-white/60">
                {hasRecommendations
                  ? `Skenario aktif: ${activeScenarioId ?? 'simulasi'}`
                  : 'Daftar mengikuti filter yang aktif di peta.'}
              </p>
            </div>
            {displayedHospitals.length ? (
              displayedHospitals.map((hospital, index) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  rank={index + 1}
                  distance={getDistance(hospital)}
                  isRecommended={recommendedIds.includes(hospital.id)}
                  onSelect={onHospitalSelect}
                />
              ))
            ) : (
              <div className="rounded-lg border border-[var(--color-border)] bg-card p-4 text-sm text-[var(--color-text-secondary)] shadow-md">
                Belum ada rumah sakit untuk filter ini.
              </div>
            )}
          </div>
        ) : null}

        {activeTab === 'chat' ? (
          <div className="flex min-h-full flex-col">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-light text-teal">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Asisten AGATA</h3>
                <p className="text-xs text-white/60">GeoAI dispatch support</p>
              </div>
            </div>

            <div className="min-h-[320px] flex-1 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[190px] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-teal text-white'
                        : 'border border-[var(--color-border)] bg-card text-[var(--color-text-primary)]'
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
                  <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-card px-3 py-2">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-2 w-2 rounded-full bg-teal"
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

      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInputValue(suggestion)}
              className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white"
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
            className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-card px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-secondary)] focus:border-teal focus:ring-1 focus:ring-teal"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal text-white transition-colors duration-150 hover:bg-teal-muted disabled:cursor-not-allowed disabled:opacity-50"
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
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
        isActive ? 'bg-teal text-white' : 'text-white/70 hover:bg-navy-light hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
