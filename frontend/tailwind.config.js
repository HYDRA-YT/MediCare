/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7fa',
          100: '#d7edf3',
          200: '#b0dbe7',
          300: '#7cc0d6',
          400: '#4aa4c4',
          500: '#2d8aab',
          600: '#226f8d',
          700: '#1d5972',
          800: '#1b4b60',
          900: '#1a3f51',
          950: '#0d2937',
        },
        accent: {
          50: '#eefbf6',
          100: '#d6f5ea',
          200: '#b0e9d7',
          300: '#7bd6bd',
          400: '#47bc9e',
          500: '#26a184',
          600: '#18816b',
          700: '#156757',
          800: '#145246',
          900: '#12443b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,42,67,.06), 0 8px 24px -12px rgba(16,42,67,.18)',
        soft: '0 2px 10px rgba(16,42,67,.06)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.55' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .35s ease both',
        toastIn: 'toastIn .2s ease both',
        pulseSoft: 'pulseSoft 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
