/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 60% - Dominant (Headers, Nav, Primary Buttons)
        primary: '#1B4D89', // SLIIT Blue
        
        // 30% - Secondary (Backgrounds, Cards)
        secondary: '#F5F7FA', // Light Gray
        
        // 10% - Accent (CTA, Alerts)
        accent: '#FF6B35', // Orange Accent
        
        // Extra: A darker blue for hover states on primary buttons
        'primary-dark': '#123661', 
      }
    },
  },
  plugins: [],
}