/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'grid-pattern': "url('data:image/svg+xml;utf8,<svg ...')", // pattern nền
      },
    },
  },
  plugins: [],
}
