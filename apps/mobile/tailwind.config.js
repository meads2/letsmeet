/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFB3B3',
          400: '#FF8E8E',
          500: '#FF6B6B',  // Main primary (warm coral)
          600: '#E65555',
          700: '#CC4444',
          800: '#B33333',
          900: '#992222',
        },
        secondary: {
          50: '#F5F3F7',
          100: '#EBE7EF',
          200: '#D7CFE0',
          300: '#C3B7D0',
          400: '#B8A4D3',
          500: '#9B7EBD',  // Main secondary (soft purple)
          600: '#8B6EAD',
          700: '#7B5E9D',
          800: '#6B4E8D',
          900: '#5B3E7D',
        },
        accent: {
          50: '#FFFEF0',
          100: '#FFFCE0',
          200: '#FFF9C2',
          300: '#FFF5A3',
          400: '#FFF085',
          500: '#FFD93D',  // Main accent (warm yellow)
          600: '#FFC93C',
          700: '#E6B634',
          800: '#CCA32D',
          900: '#B39026',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px',
      },
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}
