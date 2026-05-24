'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Cross, MapPinned } from 'lucide-react';
import { AgentStatusBar, HospitalSidebar } from '@/components/webgis';
import { defaultChatResponse, matchScenario } from '@/lib/mock/chatResponses';
import { mockAgentSteps } from '@/lib/mock/agentSteps';
import { mockHospitals } from '@/lib/mock/hospitals';
import { getScenarioDistance } from '@/lib/mock/scenarioDistances';
import type { Hospital, Message } from '@/types';

const MapView = dynamic(() => import('@/components/webgis/MapView'), {
  ssr: false,
  loading: () => (
    <section className="flex h-full flex-1 items-center justify-center bg-[#07101f]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-teal)] border-t-transparent" />
        <p className="text-sm text-[var(--color-text-muted)]">Memuat peta...</p>
      </div>
    </section>
  ),
});

const initialSystemMessage: Message = {
  id: 'system-welcome',
  role: 'system',
  content:
    'Halo! Saya AGATA. Masukkan lokasi pasien di Jakarta untuk mendapatkan rekomendasi rumah sakit terdekat.',
  timestamp: new Date(),
};

function createMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function FullscreenDashboardPage() {
  const [messages, setMessages] = useState<Message[]>([initialSystemMessage]);
  const [patientLocation, setPatientLocation] = useState<[number, number] | null>(null);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [recommendedHospitals, setRecommendedHospitals] = useState<Hospital[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleHospitalSelect = useCallback((hospital: Hospital) => {
    setSelectedHospitalId(hospital.id);
    setSidebarOpen(true);
  }, []);

  const handleQuery = useCallback(
    (input: string) => {
      if (isRunning) return;

      clearTimers();
      setSidebarOpen(true);
      setPatientLocation(null);
      setRecommendedIds([]);
      setRecommendedHospitals([]);
      setActiveScenarioId(null);
      setSelectedHospitalId(null);
      setIsDone(false);
      setIsRunning(true);
      setIsLoading(true);
      setCurrentStepId(null);

      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId('user'),
          role: 'user',
          content: input,
          timestamp: new Date(),
        },
      ]);

      mockAgentSteps.forEach((step, index) => {
        const timer = window.setTimeout(() => {
          setCurrentStepId(step.id);
        }, index * step.durationMs);
        timersRef.current.push(timer);
      });

      const totalDuration = mockAgentSteps.reduce((sum, step) => sum + step.durationMs, 0);
      const finishTimer = window.setTimeout(() => {
        const matchedScenario = matchScenario(input);
        let assistantMessage: Message;

        if (matchedScenario) {
          const matchedHospitals = matchedScenario.recommendedHospitalIds
            .map((hospitalId) => mockHospitals.find((hospital) => hospital.id === hospitalId))
            .filter((hospital): hospital is Hospital => Boolean(hospital));

          setPatientLocation(matchedScenario.patientLocation);
          setRecommendedIds(matchedScenario.recommendedHospitalIds);
          setRecommendedHospitals(matchedHospitals);
          setActiveScenarioId(matchedScenario.id);

          assistantMessage = {
            id: createMessageId('assistant'),
            role: 'assistant',
            content: matchedScenario.chatResponse,
            timestamp: new Date(),
            hospitals: matchedHospitals,
          };
        } else {
          assistantMessage = {
            id: createMessageId('assistant'),
            role: 'assistant',
            content: defaultChatResponse,
            timestamp: new Date(),
          };
        }

        setMessages((previous) => [...previous, assistantMessage]);
        setIsRunning(false);
        setIsLoading(false);
        setCurrentStepId(null);
        setIsDone(true);

        const doneTimer = window.setTimeout(() => {
          setIsDone(false);
        }, 2000);
        timersRef.current.push(doneTimer);
      }, totalDuration);
      timersRef.current.push(finishTimer);
    },
    [clearTimers, isRunning],
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <AgentStatusBar
        steps={mockAgentSteps}
        currentStepId={currentStepId}
        isRunning={isRunning}
        isDone={isDone}
      />

      <nav className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-300">
            <MapPinned className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-400 text-slate-950">
              <Cross className="h-2.5 w-2.5" />
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--color-text)]">
              AGATA Fullscreen Command Center
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Agentic GeoAI untuk rekomendasi RS ambulans Jakarta
            </p>
          </div>
        </div>
        <div className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] sm:block">
          TRL Phase 3 · Showcase MVP
        </div>
      </nav>

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-0 flex flex-1 bg-[#07101f]">
          <MapView
            hospitals={mockHospitals}
            patientLocation={patientLocation}
            recommendedIds={recommendedIds}
            selectedHospitalId={selectedHospitalId}
            onHospitalClick={handleHospitalSelect}
          />
        </div>

        <aside
          className="absolute bottom-0 right-0 top-0 z-40 flex w-[340px] flex-col border-l border-[var(--color-border)] shadow-2xl transition-transform duration-300 ease-in-out"
          style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
          <HospitalSidebar
            activeScenarioId={activeScenarioId}
            isLoading={isLoading}
            messages={messages}
            recommendedHospitals={recommendedHospitals}
            recommendedIds={recommendedIds}
            getDistance={(hospitalId) => getScenarioDistance(activeScenarioId, hospitalId)}
            onClose={() => setSidebarOpen(false)}
            onHospitalSelect={handleHospitalSelect}
            onQuery={handleQuery}
          />
        </aside>

        {!sidebarOpen ? (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="absolute right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-md border border-r-0 border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-muted)] shadow-md transition hover:text-[var(--color-text)]"
            aria-label="Buka panel"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
      </main>
    </div>
  );
}
