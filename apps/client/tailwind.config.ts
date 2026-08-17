import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './translateLocale/**/*.json'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2rem'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-jost)', 'Jost', 'var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        fresh: {
          primary: '#6B8E23', // Olive Green
          title: '#0F172A',   // Slate Dark
          subtitle: '#334155', // Slate-700
          body: '#475569',     // Slate-600
          accent: '#C8553D',   // Pastel Rust
          label: '#0F172A',
          success: '#6B8E23',
          neutral: '#64748B',  // Slate-500
          warning: '#C8553D',  // Pastel Rust / Warning
          surface: '#F8FAFC',  // Slate-50
          dark: '#0F172A'      // Slate-900
        },
        brand: {
          DEFAULT: '#6B8E23',
          foreground: '#ffffff',
          green: '#6B8E23',
          rust: '#C8553D',
          violet: '#7C3AED',
          dark: '#0F172A',
        },
        primary: {
          DEFAULT: '#6B8E23',
          foreground: '#ffffff',
        },
        ink: {
          1: '#0F172A',
          2: '#1E293B',
          3: '#334155',
          4: '#64748B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        muted: {
          DEFAULT: '#F8FAFC',
          foreground: '#64748B',
        },
        border: '#E2E8F0', // Slate-200
      },
      fontSize: {
        display: ['32px', {lineHeight: '1.2', fontWeight: '700'}],
        section: ['22px', {lineHeight: '1.3', fontWeight: '700'}],
        subtitle: ['18px', {lineHeight: '1.4', fontWeight: '700'}],
        'body-prominent': ['16px', {lineHeight: '1.5', fontWeight: '700'}],
        'body-regular': ['15px', {lineHeight: '1.6', fontWeight: '400'}],
        accent: ['14px', {lineHeight: '1.5', fontWeight: '500'}],
        label: ['14px', {lineHeight: '1.5', fontWeight: '600'}]
      },
      boxShadow: {
        panel: '0 18px 55px rgba(15, 23, 42, 0.08)',
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 18px 48px rgba(2,51,55,0.35)'
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(circle at top left, rgba(255,92,1,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(33,196,93,0.16), transparent 28%)'
      }
    }
  },
  plugins: []
};

export default config;