'use client';

import { useEffect, useState } from 'react';
import { Cross, HelpCircle, MapPinned, Moon, Sun } from 'lucide-react';

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
  const statusLabel = isDone ? 'Done' : isRunning && currentStepId ? `Step ${currentStepId}` : 'Active';

  useEffect(() => {
    setClock(formatClock(new Date()));
    const interval = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex shrink-0 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-navy px-4 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-teal">
            <MapPinned className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-white">
              <Cross className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-bold tracking-tight text-white">AGATA</div>
            <div className="truncate text-xs text-white/50">
              Agentic GeoAI - Ambulance & Triage
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-white/10 px-2 py-1 text-xs text-white/80 sm:inline-flex">
            TRL Phase 3
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            title={isLightMode ? 'Enable dark mode' : 'Enable light mode'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white"
            aria-label={isLightMode ? 'Enable dark mode' : 'Enable light mode'}
          >
            {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            type="button"
            title="AGATA MVP demo uses mock data for a research showcase."
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <div className="rounded-full bg-white/10 px-2 py-1 font-mono text-xs text-white/80">
            {clock}
          </div>
        </div>
      </header>
    </div>
  );
}
