/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware palette — every value resolves through a CSS variable
        // defined in index.css (light values on :root, dark values on .dark),
        // so a single class toggle restyles the whole site.
        white: 'rgb(var(--c-white) / <alpha-value>)',
        black: 'rgb(var(--c-black) / <alpha-value>)',
        primary: { DEFAULT: 'rgb(var(--c-primary) / <alpha-value>)' },
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        section: 'rgb(var(--c-section) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        edge: 'rgb(var(--c-edge) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        overlay: 'rgb(var(--c-overlay) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Poppins', 'Inter', 'sans-serif'],
        sans: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        blob: 'blob 14s ease-in-out infinite',
        'blob-slow': 'blob 20s ease-in-out infinite reverse',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'spin-slow': 'spin 14s linear infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'pulse-ring': 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora': 'aurora 18s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.5' },
          '50%': { transform: 'translate(6%, -6%) scale(1.15)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
