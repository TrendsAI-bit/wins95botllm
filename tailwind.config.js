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
        'win95-gray': '#c0c0c0',
        'win95-dark-gray': '#808080',
        'win95-light-gray': '#dfdfdf',
        'win95-blue': '#0000ff',
        'win95-dark-blue': '#000080',
        'win95-cyan': '#008080',
        'win95-green': '#008000',
        'win95-yellow': '#ffff00',
        'win95-red': '#ff0000',
        'win95-magenta': '#ff00ff',
        'win95-black': '#000000',
        'win95-white': '#ffffff',
        'win95-silver': '#c0c0c0',
      },
      fontFamily: {
        'ms-sans': ['"MS Sans Serif"', 'sans-serif'],
        'system': ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        'win95-inset': 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #ffffff',
        'win95-outset': 'inset -1px -1px #dfdfdf, inset 1px 1px #0a0a0a, inset -2px -2px #ffffff, inset 2px 2px #808080',
        'win95-button': 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
        'win95-pressed': 'inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080',
      }
    },
  },
  plugins: [],
}
