import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* MULTIVERUS Brand */
        navy:  '#0A0E14',
        blue:  '#8B5CF6',
        vivid: '#2DD4BF',
        sky:   '#2DD4BF',
        celeste: '#0D1A1F',
        or:    '#FBBF24',
        or2:   '#FBBF24',
        'bg-light': '#111722',
        surface: '#111722',
        line: '#1F2633',
        bdr:   '#1F2633',
        muted: '#8A94A6',
        dim:   '#5B6472',
        /* shadcn/ui */
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        roboto:    ['Inter', 'sans-serif'],
        condensed: ['Inter', 'sans-serif'],
        caveat:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'pulse-led':   'pulse-led 2s infinite',
        'tick':        'tick 20s linear infinite',
        'pulse-ring':  'pulse-ring 8s infinite alternate ease-in-out',
        'fade-in-up':  'fade-in-up 0.6s ease-out both',
      },
      keyframes: {
        'pulse-led': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.3' },
        },
        tick: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'translate(200px,-200px) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translate(200px,-200px) scale(1.05)', opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
