/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      
      fontfamily:{
        handwriting:["'Shadows into Light'","cursive"]
      }
    },
  },
  plugins: [],
}

