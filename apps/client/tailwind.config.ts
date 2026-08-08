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
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        fresh: {
          primary: '#023337',
          title: '#191919',
          subtitle: '#23272E',
          body: '#5B6068',
          accent: '#FF5C01',
          label: '#191919',
          success: '#21C45D',
          neutral: '#6A717F',
          warning: '#EBCE01',
          surface: '#F5F7FA',
          dark: '#0B1020'
        },
        brand: {
          DEFAULT: '#023337',
          foreground: '#ffffff',
        },
        primary: {
          DEFAULT: '#023337',
          foreground: '#ffffff',
        },
        ink: {
          1: '#023337',
          2: '#191919',
          3: '#23272E',
          4: '#5B6068',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#191919',
        },
        muted: {
          DEFAULT: '#F1F4F9',
          foreground: '#5B6068',
        },
        border: '#E6EAF2',
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