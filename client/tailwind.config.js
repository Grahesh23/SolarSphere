/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Solar / navy primary palette
        navy: {
          50: '#f0f4fa',
          100: '#dce6f4',
          200: '#b9cce8',
          300: '#8ba8d6',
          400: '#5a7fbf',
          500: '#3a5fa3',
          600: '#2b4787',
          700: '#22376b',
          800: '#1a2a4f',
          900: '#121d3a',
          950: '#0a1226',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Purple accent for the Odoo hackathon theme
        grape: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(18, 29, 58, 0.06), 0 1px 2px -1px rgba(18, 29, 58, 0.05)',
        'card-lg': '0 4px 12px -2px rgba(18, 29, 58, 0.08), 0 2px 6px -2px rgba(18, 29, 58, 0.06)',
        glow: '0 0 0 1px rgba(168, 85, 247, 0.15), 0 8px 24px -8px rgba(168, 85, 247, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
