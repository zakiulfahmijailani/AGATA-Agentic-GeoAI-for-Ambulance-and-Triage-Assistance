'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, Cross, MapPinned } from 'lucide-react';
import { AgentStatusBar, HospitalSidebar } from '@/components/webgis';
import { defaultChatResponse, matchScenario } from '@/lib/mock/chatResponses';
import { mockAgentSteps } from '@/lib/mock/agentSteps';
import type { Hospital, HospitalFilters, Message } from '@/types';

const MapView = dynamic(() => import('@/components/webgis/MapView'), {
  ssr: false,
  loading: () => (
    <section className="flex h-full flex-1 items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
        <p className="text-sm text-[var(--color-text-secondary)]">Loading map...</p>
      </div>
    </section>
  ),
});

const initialSystemMessage: Message = {
  id: 'system-welcome',
  role: 'system',
  content:
    'Hello! I am AGATA. Enter the patient location in Jakarta to get the nearest hospital recommendations.',
  timestamp: new Date(),
};

const defaultFilters: HospitalFilters = {
  zone: 'All',
  traumaLevel: 'All',
  erStatus: 'All',
};

interface NearestHospitalsApiResponse {
  hospitals?: Hospital[];
  data?: Hospital[];
}

function createMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDistance(distance?: number): string {
  return typeof distance === 'number' ? `${distance.toFixed(1)} km` : 'distance unavailable';
}

function createNearestHospitalResponse(query: string, hospitals: Hospital[]): string {
  if (!hospitals.length) {
    return `Analysis complete for "${query}", but no hospitals in the search radius can be recommended from the Neon data yet.`;
  }

  const lines = hospitals.map((hospital, index) => {
    return `${index + 1}. **${hospital.name}** - ${formatDistance(hospital.distance_km)} - TL${hospital.trauma_level} - ER ${hospital.er_status} - ${hospital.available_beds}/${hospital.capacity} beds available`;
  });

  return `Analysis complete for "${query}". Nearest recommendations from the 234 Jakarta hospital records:\n\n${lines.join('\n')}\n\nThe map has marked the patient location and recommended hospitals.`;
}

async function fetchNearestHospitals(patientLocation: [number, number]): Promise<Hospital[]> {
  const [lng, lat] = patientLocation;
  const response = await fetch(`/api/hospitals/nearest?lat=${lat}&lng=${lng}&limit=3`);

  if (!response.ok) return [];

  const data = (await response.json()) as NearestHospitalsApiResponse;
  return data.hospitals ?? data.data ?? [];
}

export default function FullscreenDashboardPage() {
  const [messages, setMessages] = useState<Message[]>([initialSystemMessage]);
  const [filters, setFilters] = useState<HospitalFilters>(defaultFilters);
  const [visibleHospitals, setVisibleHospitals] = useState<Hospital[]>([]);
  const [patientLocation, setPatientLocation] = useState<[number, number] | null>(null);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);
  const [recommendedHospitals, setRecommendedHospitals] = useState<Hospital[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
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

  const handleFiltersChange = useCallback((nextFilters: HospitalFilters) => {
    setFilters(nextFilters);
    setRecommendedIds([]);
    setRecommendedHospitals([]);
    setSelectedHospitalId(null);
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
      const finishTimer = window.setTimeout(async () => {
        const matchedScenario = matchScenario(input);
        let assistantMessage: Message;

        if (matchedScenario) {
          const matchedHospitals = await fetchNearestHospitals(matchedScenario.patientLocation);

          setPatientLocation(matchedScenario.patientLocation);
          setRecommendedIds(matchedHospitals.map((hospital) => hospital.id));
          setRecommendedHospitals(matchedHospitals);
          setActiveScenarioId(matchedScenario.id);

          assistantMessage = {
            id: createMessageId('assistant'),
            role: 'assistant',
            content: createNearestHospitalResponse(input, matchedHospitals),
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
    <div className="flex h-screen w-full flex-col overflow-hidden bg-surface text-[var(--color-text-primary)]">
      <header className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-navy px-4 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-teal">
            <MapPinned className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-white">
              <Cross className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-white">AGATA</h1>
            <p className="truncate text-xs text-white/50">Agentic GeoAI - Ambulance & Triage</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-white/10 px-2 py-1 text-xs text-white/80 sm:inline-flex">
            TRL Phase 3
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            Active
          </span>
        </div>
      </header>

      <AgentStatusBar
        steps={mockAgentSteps}
        currentStepId={currentStepId}
        isRunning={isRunning}
        isDone={isDone}
      />

      <main className="relative flex min-h-0 flex-1 overflow-hidden bg-surface">
        <aside
          className="relative z-40 flex w-[var(--sidebar-width)] shrink-0 flex-col bg-navy text-white shadow-md transition-[margin] duration-300 ease-in-out"
          style={{ marginLeft: sidebarOpen ? '0' : 'calc(var(--sidebar-width) * -1)' }}
        >
          <HospitalSidebar
            activeScenarioId={activeScenarioId}
            isLoading={isLoading}
            messages={messages}
            recommendedHospitals={recommendedHospitals}
            visibleHospitals={visibleHospitals}
            recommendedIds={recommendedIds}
            getDistance={(hospital) => hospital.distance_km ?? 0}
            onClose={() => setSidebarOpen(false)}
            onHospitalSelect={handleHospitalSelect}
            onQuery={handleQuery}
          />
        </aside>

        <div className="relative z-0 flex flex-1 bg-surface">
          <MapView
            filters={filters}
            patientLocation={patientLocation}
            recommendedIds={recommendedIds}
            selectedHospitalId={selectedHospitalId}
            onFiltersChange={handleFiltersChange}
            onHospitalClick={handleHospitalSelect}
            onHospitalsChange={setVisibleHospitals}
          />
        </div>

        {!sidebarOpen ? (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-md border border-l-0 border-[var(--color-border)] bg-card p-2 text-[var(--color-text-secondary)] shadow-md transition-colors duration-150 hover:text-[var(--color-text-primary)]"
            aria-label="Open panel"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </main>
    </div>
  );
}
