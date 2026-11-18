/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',    // 16px - px-4
          sm: '1.5rem',       // 24px - sm:px-6
          md: '2rem',         // 32px - md:px-8
          lg: '2rem',         // 32px - lg:px-8
          xl: '2rem',         // 32px - xl:px-8
        },
      },
    },
  },
  plugins: [],
}
