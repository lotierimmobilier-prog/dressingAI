/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#161616',
        'surface-2': '#1E1E1E',
        accent: {
          // Couleur d'accent pilotée par une variable CSS → personnalisable
          // en direct (voir src/lib/theme.js). Défaut = violet de marque.
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft-rgb) / <alpha-value>)',
        },
        brand: {
          violet: '#7B6CE0',
          'violet-deep': '#6C5CE7',
          'violet-light': '#A48DE8',
          ink: '#232A47', // navy du logo
        },
        coral: '#FF6B6B', // corail vif (accent secondaire)
        mint: '#A8E6CF', // menthe douce (accent tertiaire)
        cream: '#F5F5F0', // texte principal (blanc cassé chaud)
        muted: '#888888', // texte secondaire
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl2: '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--accent-rgb) / 0.5)',
        'glow-coral': '0 0 40px -8px rgba(255, 107, 107, 0.45)',
        card: '0 8px 30px -12px rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        'mirror-rotate': {
          '0%': { transform: 'rotate(0deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1.2)' },
        },
        'mirror-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.85' },
        },
        'fabric-fall': {
          '0%': { opacity: '0', transform: 'translateY(-18px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'mirror-rotate': 'mirror-rotate 26s linear infinite',
        'mirror-pulse': 'mirror-pulse 8s ease-in-out infinite',
        'fabric-fall': 'fabric-fall 0.5s ease-out',
        shimmer: 'shimmer 2.5s linear infinite',
        'float-slow': 'float-slow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
