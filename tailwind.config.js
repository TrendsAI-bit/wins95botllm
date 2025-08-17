/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Windows XP Color Scheme
        'xp-blue': '#0054e3',
        'xp-dark-blue': '#003d9c',
        'xp-light-blue': '#4a90e2',
        'xp-green': '#73d216',
        'xp-orange': '#f57900',
        'xp-gray': '#ece9d8',
        'xp-dark-gray': '#aca899',
        'xp-light-gray': '#f1f0e7',
        'xp-border': '#0054e3',
        'xp-silver': '#c0c0c0',
        'xp-white': '#ffffff',
        'xp-black': '#000000',
        'xp-taskbar': '#245edb',
        'xp-start-green': '#73d216',
        'xp-desktop': '#5a7fdb',
      },
      fontFamily: {
        'ms-sans': ['"MS Sans Serif"', 'sans-serif'],
        'system': ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        'xp-window': '0 2px 8px rgba(0, 0, 0, 0.3), inset 1px 1px 0 rgba(255, 255, 255, 0.8)',
        'xp-button': '1px 1px 2px rgba(0, 0, 0, 0.2), inset 1px 1px 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 rgba(0, 0, 0, 0.1)',
        'xp-pressed': 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)',
        'xp-panel': 'inset 1px 1px 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 rgba(0, 0, 0, 0.1)',
        'xp-taskbar': '0 -1px 3px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
