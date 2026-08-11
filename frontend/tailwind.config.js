/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        secondary: '#1A1A1A',
        accent: '#FFFFFF',
        light: '#6B6B6B',
        background: '#FFFFFF',
        muted: '#F4F4F4',
        border: '#E0E0E0',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
