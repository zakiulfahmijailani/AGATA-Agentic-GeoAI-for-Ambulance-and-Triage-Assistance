import Link from 'next/link';
import { ArrowRight, Cross, MapPinned } from 'lucide-react';

const badges = ['15 Rumah Sakit', '4 AI Agents', 'Real-time GeoAI'];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1120] text-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(20,184,166,0.18),transparent_45%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300 shadow-2xl shadow-sky-500/10">
          <div className="relative">
            <MapPinned className="h-11 w-11" />
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-slate-950">
              <Cross className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <p className="mb-3 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
          Universitas Bakrie × Cardiff University
        </p>
        <h1 className="text-6xl font-black tracking-normal text-white sm:text-7xl">AGATA</h1>
        <p className="mt-4 text-xl font-semibold text-sky-200">
          Agentic GeoAI for Ambulance and Triage Assistance
        </p>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Sistem rekomendasi rumah sakit berbasis multi-agent AI dan analisis geospasial real-time.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-slate-600/70 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              {badge}
            </span>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-10 inline-flex items-center gap-2 rounded-md bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-sky-500/20 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          Buka Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>

        <footer className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <span>SDG 3</span>
          <span>SDG 9</span>
          <span>SDG 11</span>
          <span>Agentic GeoAI Research Roadmap 2023-2027 - TRL Phase 3</span>
        </footer>
      </section>
    </main>
  );
}
