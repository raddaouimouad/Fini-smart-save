/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050d1e',
          900: '#0a1628',
          800: '#0f1f3d',
          700: '#152848',
          600: '#1c3454',
          500: '#244063',
        },
        mint: {
          50: '#edfdf8',
          100: '#d3f9f0',
          200: '#aaf0e1',
          300: '#72e3cc',
          400: '#38cfb4',
          500: '#10B981',
          600: '#0d9268',
          700: '#0e7555',
          800: '#105d44',
          900: '#104d3a',
        },
        fini: {
          navy: '#0a1628',
          mint: '#10B981',
          purple: '#7C3AED',
          yellow: '#F59E0B',
          'card': '#0f1f3d',
          'card-hover': '#152848',
          'border': '#1c3454',
          'text': '#E2E8F0',
          'muted': '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      }
    },
  },
  plugins: [],
}
