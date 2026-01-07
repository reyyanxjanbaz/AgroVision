/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Agro-Diamond" Palette
        background: '#FAFAFA', // Zinc 50
        surface: '#FFFFFF',
        surfaceHighlight: '#F4F4F5', // Zinc 100
        primary: '#047857',    // Emerald 700 - Maximized Contrast
        primaryGlow: '#059669', // Emerald 600
        secondary: '#064E3B',  // Emerald 800
        accent: '#B45309',     // Amber 700
        danger: '#B91C1C',     // Red 700
        text: {
          primary: '#18181B',  // Zinc 900
          secondary: '#3F3F46', // Zinc 700 (Darker)
          muted: '#52525B',    // Zinc 600 (Darker)
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0,0,0,0.04)',
        'lift': '0 20px 40px rgba(0,0,0,0.08)',
        'glow-green': '0 0 40px -10px rgba(16, 185, 129, 0.4)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'float': 'float 6s ease-in-out infinite',
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
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
}