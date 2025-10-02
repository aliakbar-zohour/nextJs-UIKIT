/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/widgets/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'yekan': ['YekanBakh', 'Tahoma', 'sans-serif'],
        'sans': ['YekanBakh', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
