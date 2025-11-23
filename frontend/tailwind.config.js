/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Command Center Palette
        background: '#0B1121', // Deep midnight blue
        surface: '#151E32',    // Slightly lighter blue for cards
        surfaceHighlight: '#1E293B',
        primary: '#3B82F6',    // Electric Blue
        primaryGlow: '#60A5FA',
        secondary: '#10B981',  // Signal Green (Success/Growth)
        accent: '#F59E0B',     // Amber (Warning/Attention)
        danger: '#EF4444',     // Red (Threats)
        text: {
          primary: '#F8FAFC',  // Almost white
          secondary: '#94A3B8', // Muted blue-grey
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
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