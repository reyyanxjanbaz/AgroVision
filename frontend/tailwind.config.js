/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light & Green "Eco-Vision" Palette
        background: '#F9FAFB', // Gray 50 - Clean, high visibility
        surface: '#FFFFFF',    // Pure White
        surfaceHighlight: '#F3F4F6', // Gray 100
        primary: '#16A34A',    // Green 600 - Vibrant Nature Green
        primaryGlow: '#4ADE80', // Green 400
        secondary: '#059669',  // Emerald 600 - Deep Green
        accent: '#D97706',     // Amber 600 - Earthy Orange
        danger: '#DC2626',     // Red 600
        text: {
          primary: '#111827',  // Gray 900 - High Contrast
          secondary: '#4B5563', // Gray 600
          muted: '#9CA3AF',    // Gray 400
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px -5px rgba(22, 163, 74, 0.3)',
        'glow-emerald': '0 0 20px -5px rgba(5, 150, 105, 0.3)',
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}