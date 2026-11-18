/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Surface scale: each section alternates between these for gentle depth
        ink: '#09090b',
        surface: '#0e0e11',
        card: '#131317',
        line: 'rgba(255, 255, 255, 0.08)',
        accent: '#e11d48'
      },
      // Font family is intentionally unchanged (Plus Jakarta Sans everywhere)
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['Plus Jakarta Sans', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        widest: '0.15em'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -8px, 0)' }
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': {
          from: { opacity: '0', transform: 'translate3d(0, 10px, 0) scale(0.97)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.45s ease-out both',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
      }
    }
  },
  plugins: []
};
