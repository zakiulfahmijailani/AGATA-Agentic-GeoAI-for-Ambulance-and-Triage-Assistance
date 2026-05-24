'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
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
    <div className="min-w-[220px]">
      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Analisis Selesai</span>
          </motion.div>
        ) : isRunning && activeStep ? (
          <motion.div
            key={`running-${activeStep.id}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: `${activeStep.color}18`,
              borderColor: `${activeStep.color}55`,
              color: activeStep.color,
            }}
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
            <span className="truncate">{activeStep.name}</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-300"
          >
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            <span>Sistem Siap</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
