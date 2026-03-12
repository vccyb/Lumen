import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'lumen-base': '#F4F4F6',
        'lumen-surface': '#FFFFFF',
        'lumen-text-primary': '#111111',
        'lumen-text-secondary': '#666666',
        'lumen-text-tertiary': '#999999',
        'lumen-border-subtle': '#EAEAEA',
        'lumen-border-focus': '#CCCCCC',
        'lumen-accent-gold': '#F0A07A',
        'lumen-warm-start': '#E28B6B',
        'lumen-warm-end': '#D5546C',
        'lumen-blue': '#007AFF',
        'lumen-gray-inactive': '#8E8E93',
        'lumen-bg-system': '#F2F2F7',

        // Dark mode colors
        'dark-lumen-base': '#1C1C1E',
        'dark-lumen-surface': '#2C2C2E',
        'dark-lumen-text-primary': '#FFFFFF',
        'dark-lumen-text-secondary': '#98989D',
        'dark-lumen-text-tertiary': '#636366',
        'dark-lumen-border-subtle': '#38383A',
        'dark-lumen-border-focus': '#48484A',
        'dark-lumen-bg-system': '#1C1C1E',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      spacing: {
        '15': '60px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      },
      boxShadow: {
        'subtle': '0 4px 24px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 80px 15px rgba(245, 165, 120, 0.25)',
        'dark-subtle': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'dark-elevated': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'dark-glow': '0 0 80px 15px rgba(245, 165, 120, 0.15)',
      },
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'emphasis': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'deceleration': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'acceleration': 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
