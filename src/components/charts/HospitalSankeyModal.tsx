'use client';

import HospitalSankeyChart from '@/components/charts/HospitalSankeyChart';
import type { HospitalIndex, HospitalPillarVariables } from '@/lib/types';

interface HospitalSankeyModalProps {
  hospital: { index: HospitalIndex; pillars: HospitalPillarVariables } | null;
  onClose: () => void;
}

export default function HospitalSankeyModal({ hospital, onClose }: HospitalSankeyModalProps) {
  if (!hospital) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <section
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#0D2137]">{hospital.index.hospital_name}</h2>
            <div className="mt-2 inline-flex rounded-full bg-[#00B4B4] px-3 py-1 text-sm font-bold text-white">
              AGATA Index: {hospital.index.agata_index.toFixed(3)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sankey modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-lg font-bold text-slate-500 transition-colors hover:border-[#00B4B4] hover:text-[#00B4B4]"
          >
            X
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <HospitalSankeyChart hospitalIndex={hospital.index} pillarVariables={hospital.pillars} />
        </div>
      </section>
    </div>
  );
}
