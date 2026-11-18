/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Noto Sans Mongolian', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#050b1c',
          900: '#081226',
          800: '#0c1a35',
          700: '#122448',
          600: '#1a3260',
        },
        gold: {
          300: '#ffe9a8',
          400: '#ffd76e',
          500: '#f5b93d',
          600: '#d99a1f',
        },
        skyx: {
          300: '#9fd8ff',
          400: '#6cc0f5',
          500: '#38a8e8',
        },
        festive: {
          400: '#f05a5a',
          500: '#d93a3a',
          600: '#b02a2a',
        },
      },
      animation: {
        'float-slow': 'floatY 7s ease-in-out infinite',
        'float-slower': 'floatY 11s ease-in-out infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        'pop-in': 'popIn 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.4) both',
        'fade-up': 'fadeUp 0.6s ease both',
        'spin-slow': 'spin 14s linear infinite',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(245, 185, 61, 0.25)',
        'glow-blue': '0 0 40px rgba(56, 168, 232, 0.22)',
      },
    },
  },
  plugins: [],
};
