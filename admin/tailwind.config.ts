import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* MultiVerus Brand */
        navy:  '#030816',
        blue:  '#0047AB',
        vivid: '#1557E8',
        sky:   '#00A3FF',
        celeste: '#F0F9FF',
        or:    '#F59E0B',
        or2:   '#FBBF24',
        'bg-light': '#F8FAFC',
        bdr:   '#E2E8F0',
        muted: '#475569',
        dim:   '#94A3B8',
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
        roboto:    ['Roboto', 'sans-serif'],
        condensed: ['Roboto Condensed', 'sans-serif'],
        caveat:    ['Caveat', 'cursive'],
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
