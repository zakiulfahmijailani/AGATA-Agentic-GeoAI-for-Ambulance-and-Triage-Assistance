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
    <div className="flex h-9 w-full shrink-0 items-center justify-between border-b border-white/10 bg-navy-light px-4 text-xs text-white/70">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
        </span>
        <span className="text-white/80">
          AGATA Agent <span className="mx-1 text-white/30">-</span>
          <span className="rounded-full bg-teal/20 px-2 py-0.5 font-medium text-teal">Active</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="hidden items-center gap-2 text-green-400 sm:inline-flex"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold">Analysis Complete</span>
          </motion.div>
        ) : isRunning && activeStep ? (
          <motion.div
            key={`running-${activeStep.id}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="hidden max-w-[48vw] items-center gap-2 truncate text-teal sm:inline-flex"
          >
            <span className="flex h-4 w-4 items-center justify-center gap-0.5">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full bg-teal"
                  style={{ animation: `typingBounce 0.9s ${dot * 0.12}s infinite ease-in-out` }}
                />
              ))}
            </span>
            <span className="truncate">
              {activeStep.name} - {activeStep.description}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="hidden items-center gap-2 text-white/60 sm:inline-flex"
          >
            <RadioTower className="h-4 w-4 text-teal" />
            <span>Pipeline ready for patient location</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="font-mono text-white/60">
        {currentStepId ? `Step ${currentStepId}/${steps.length}` : 'Standby'}
      </div>
    </div>
  );
}
