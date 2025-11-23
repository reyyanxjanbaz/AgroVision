/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light & Green Palette
        background: '#F0FDF4', // Very light green/white (green-50)
        surface: '#FFFFFF',    // Pure white for cards
        surfaceHighlight: '#DCFCE7', // Light green highlight (green-100)
        primary: '#16A34A',    // Green-600
        primaryGlow: '#4ADE80', // Green-400
        secondary: '#0D9488',  // Teal-600 (Complementary)
        accent: '#F59E0B',     // Amber (Warning/Attention)
        danger: '#EF4444',     // Red (Threats)
        text: {
          primary: '#1E293B',  // Slate-800
          secondary: '#64748B', // Slate-500
          muted: '#94A3B8',    // Slate-400
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(22, 163, 74, 0.3)', // Green glow
        'glow-secondary': '0 0 20px -5px rgba(13, 148, 136, 0.3)', // Teal glow
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)', // Softer shadow for light mode
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