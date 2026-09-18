/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#131313',
        surface: '#2d2d2d',
        frame: '#313131',
        mint: {
          DEFAULT: '#3cffd0',
          border: '#309875',
          faint: 'rgba(60, 255, 208, 0.1)',
        },
        uv: {
          DEFAULT: '#5200ff',
          rule: '#3d00bf',
          faint: 'rgba(82, 0, 255, 0.15)',
        },
        link: '#3860be',
        focus: '#1eaedb',
        hazard: '#ffffff',
        muted: '#e9e9e9',
        secondary: '#949494',
        health: {
          green: '#3cffd0',
          amber: '#ffb703',
          red: '#ff3366',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Anton"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        '2px': '2px',
        '3px': '3px',
        '4px': '4px',
        '20px': '20px',
        '24px': '24px',
        '30px': '30px',
        '40px': '40px',
      },
      letterSpacing: {
        'verge-nano': '1.1px',
        'verge-mono': '1.5px',
        'verge-wide': '1.9px',
      },
    },
  },
  plugins: [],
}
