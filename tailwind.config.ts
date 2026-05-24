import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-faint': 'var(--color-text-faint)',
        primary: 'var(--color-primary)',
        'primary-glow': 'var(--color-primary-glow)',
        teal: 'var(--color-teal)',
        'teal-dim': 'var(--color-teal-dim)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        agent: {
          1: 'var(--color-agent-1)',
          2: 'var(--color-agent-2)',
          3: 'var(--color-agent-3)',
          4: 'var(--color-agent-4)',
          retrieval: '#3b82f6',
          spatial: '#10b981',
          visualization: '#f59e0b',
          report: '#8b5cf6',
        },
        brand: {
          navy: '#0f2d4a',
          teal: '#01b4bc',
          tealDim: '#0a7b82',
          light: '#e8f7f8',
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-in-right': 'slideInRight 280ms ease-out both',
        'agent-fade-in': 'agentFadeIn 220ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
