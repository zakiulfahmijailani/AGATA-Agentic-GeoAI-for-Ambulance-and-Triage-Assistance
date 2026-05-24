'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatbotPanel,
  HospitalCard,
  KpiCard,
  Topbar,
} from '@/components/webgis';
import { mockHospitals } from '@/lib/mock/hospitals';
import { defaultChatResponse, matchScenario } from '@/lib/mock/chatResponses';
import { mockAgentSteps } from '@/lib/mock/agentSteps';
import { dashboardStats } from '@/lib/mock/dashboardStats';
import type { Hospital, Message } from '@/types';

const MapView = dynamic(() => import('@/components/webgis/MapView'), {
  ssr: false,
  loading: () => <section className="h-full flex-1 bg-[#07101f]" />,
});

const initialSystemMessage: Message = {
  id: 'system-welcome',
  role: 'system',
  content:
    'Halo! Saya AGATA. Masukkan lokasi pasien di Jakarta untuk mendapatkan rekomendasi rumah sakit terdekat.',
  timestamp: new Date(),
};

const scenarioDistances: Record<string, Record<string, number>> = {
  'jakarta-pusat': {
    rscm: 2.1,
    'rs-islam-jakarta': 1.3,
    'rs-pasar-rebo': 5.4,
  },
  'jakarta-selatan': {
    'rs-fatmawati': 5.2,
    'rs-mmc': 3.1,
    'rs-brawijaya': 2.4,
  },
  'jakarta-utara': {
    'rs-premier-kelapa-gading': 0.8,
    'rs-mitra-keluarga-kelapa-gading': 1.1,
    'rsud-koja': 3.8,
  },
};

function createMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDistance(scenarioId: string | null, hospitalId: string): number {
  if (!scenarioId) return 0;
  return scenarioDistances[scenarioId]?.[hospitalId] ?? 0;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([initialSystemMessage]);
  const [patientLocation, setPatientLocation] = useState<[number, number] | null>(null);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedHospitals, setRecommendedHospitals] = useState<Hospital[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);
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
  }, []);

  const handleToggleTheme = useCallback(() => {
    setIsLightMode((previous) => !previous);
  }, []);

  const handleQuery = useCallback(
    (input: string) => {
      if (isRunning) return;

      clearTimers();
      const userMessage: Message = {
        id: createMessageId('user'),
        role: 'user',
        content: input,
        timestamp: new Date(),
      };

      setMessages((previous) => [...previous, userMessage]);
      setPatientLocation(null);
      setRecommendedIds([]);
      setRecommendedHospitals([]);
      setActiveScenarioId(null);
      setSelectedHospitalId(null);
      setIsDone(false);
      setIsRunning(true);
      setIsLoading(true);
      setCurrentStepId(null);

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

  const statCards = useMemo(
    () =>
      dashboardStats.map((stat) => (
        <KpiCard key={stat.label} value={stat.value} label={stat.label} color={stat.color} />
      )),
    [],
  );

  return (
    <main
      className={`flex h-screen flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] ${
        isLightMode ? 'theme-light' : ''
      }`}
    >
      <Topbar
        currentStepId={currentStepId}
        isRunning={isRunning}
        isDone={isDone}
        isLightMode={isLightMode}
        onToggleTheme={handleToggleTheme}
      />
      <div className="flex min-h-0 flex-1">
        <ChatbotPanel messages={messages} isLoading={isLoading} onQuery={handleQuery} />
        <MapView
          hospitals={mockHospitals}
          patientLocation={patientLocation}
          recommendedIds={recommendedIds}
          selectedHospitalId={selectedHospitalId}
          onHospitalClick={handleHospitalSelect}
        />
        <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-4 py-4">
            <h2 className="text-sm font-bold text-[var(--color-text)]">
              {recommendedHospitals.length ? 'Rekomendasi Rumah Sakit' : 'Ringkasan Operasional'}
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {recommendedHospitals.length
                ? 'Hasil simulasi multi-agent berdasarkan lokasi pasien.'
                : 'KPI mock untuk showcase AGATA TRL Phase 3.'}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {recommendedHospitals.length ? (
              <div className="space-y-3">
                {recommendedHospitals.slice(0, 3).map((hospital, index) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    rank={index + 1}
                    distance={getDistance(activeScenarioId, hospital.id)}
                    isRecommended={recommendedIds.includes(hospital.id)}
                    onSelect={handleHospitalSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">{statCards}</div>
            )}
          </div>

          {recommendedHospitals.length ? (
            <div className="border-t border-[var(--color-border)] p-4">
              <div className="grid grid-cols-2 gap-3">{statCards}</div>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
