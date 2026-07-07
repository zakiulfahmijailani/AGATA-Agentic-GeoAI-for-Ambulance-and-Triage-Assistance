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
        navy: {
          DEFAULT: '#0D2137',
          light: '#132D47',
        },
        teal: {
          DEFAULT: '#00B4B4',
          muted: '#009E9E',
        },
        surface: '#F4F6F9',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
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
