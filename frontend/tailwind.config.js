/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': '#1e3a8a',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '60%': { opacity: '1', transform: 'translateY(-5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        growWidth: {
          '0%': { width: '0%' },
          '60%': { width: 'calc(var(--target-width) + 5%)' },
          '100%': { width: 'var(--target-width)' },
        },
        drawCircle: {
          '0%': { strokeDasharray: '0, 100' },
          '100%': { strokeDasharray: 'var(--target-stroke), 100' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pop-in': 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'grow-width': 'growWidth 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'draw-circle': 'drawCircle 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }
    },
  },
  plugins: [],
}
