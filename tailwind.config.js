/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        'gold-dark': '#B8960C',
        'gold-light': '#E6D5B8',
        beige: '#F5F5DC',
        'soft-pink': '#FFB6C1',
        blush: '#F5E6E0',
        cream: '#FFFDD0',
        'luxury-black': '#0A0A0A',
        'charcoal': '#1A1A1A',
        'dark-gray': '#2D2D2D',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #2D2D2D 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.5)',
        'gold-glow-lg': '0 0 50px rgba(212, 175, 55, 0.6)',
        'luxury': '0 20px 60px rgba(0, 0, 0, 0.3)',
        'luxury-lg': '0 30px 90px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}