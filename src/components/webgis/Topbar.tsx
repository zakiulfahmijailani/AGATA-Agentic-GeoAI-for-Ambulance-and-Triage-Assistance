'use client';

import { useEffect, useState } from 'react';
import { Cross, HelpCircle, MapPinned, Moon, Sun } from 'lucide-react';
import { mockAgentSteps } from '@/lib/mock/agentSteps';
import AgentStatusBar from './AgentStatusBar';

interface TopbarProps {
  currentStepId: number | null;
  isRunning: boolean;
  isDone: boolean;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export default function Topbar({
  currentStepId,
  isRunning,
  isDone,
  isLightMode,
  onToggleTheme,
}: TopbarProps) {
  const [clock, setClock] = useState('--:--:--');

  useEffect(() => {
    setClock(formatClock(new Date()));
    const interval = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-300">
          <MapPinned className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-400 text-slate-950">
            <Cross className="h-2.5 w-2.5" />
          </span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-[var(--color-text)]">
            AGATA — Agentic GeoAI Ambulance
          </div>
          <div className="truncate text-xs text-[var(--color-text-muted)]">
            Jakarta Ambulance Recommendation
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <AgentStatusBar
          steps={mockAgentSteps}
          currentStepId={currentStepId}
          isRunning={isRunning}
          isDone={isDone}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            title={isLightMode ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            aria-label={isLightMode ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
          >
            {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            type="button"
            title="Demo MVP AGATA menggunakan data mock untuk showcase riset."
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            aria-label="Bantuan"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 font-mono text-xs text-sky-200">
          {clock}
        </div>
      </div>
    </header>
  );
}
