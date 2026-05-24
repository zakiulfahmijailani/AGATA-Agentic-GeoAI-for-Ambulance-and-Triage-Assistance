'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, RadioTower } from 'lucide-react';
import { AgentStep } from '@/types';

interface AgentStatusBarProps {
  steps: AgentStep[];
  currentStepId: number | null;
  isRunning: boolean;
  isDone: boolean;
}

export default function AgentStatusBar({
  steps,
  currentStepId,
  isRunning,
  isDone,
}: AgentStatusBarProps) {
  const activeStep = steps.find((step) => step.id === currentStepId) ?? null;

  return (
    <div className="flex h-9 w-full shrink-0 items-center justify-between border-b border-slate-700 bg-slate-950 px-4 text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        <span>
          AGATA Agent · <span className="font-semibold text-green-400">Active</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="hidden items-center gap-2 text-emerald-300 sm:inline-flex"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold">Analisis Selesai</span>
          </motion.div>
        ) : isRunning && activeStep ? (
          <motion.div
            key={`running-${activeStep.id}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="hidden max-w-[48vw] items-center gap-2 truncate sm:inline-flex"
            style={{ color: activeStep.color }}
          >
            <span className="flex h-4 w-4 items-center justify-center gap-0.5">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: activeStep.color,
                    animation: `typingBounce 0.9s ${dot * 0.12}s infinite ease-in-out`,
                  }}
                />
              ))}
            </span>
            <span className="truncate">
              {activeStep.name} · {activeStep.description}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="hidden items-center gap-2 text-slate-400 sm:inline-flex"
          >
            <RadioTower className="h-4 w-4 text-[var(--color-teal)]" />
            <span>Pipeline siap menerima lokasi pasien</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="font-mono text-slate-400">
        {currentStepId ? `Step ${currentStepId}/${steps.length}` : 'Standby'}
      </div>
    </div>
  );
}
