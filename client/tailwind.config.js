import { fileURLToPath, URL } from 'node:url';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    fileURLToPath(new URL('./index.html', import.meta.url)),
    fileURLToPath(new URL('./src/**/*.{js,jsx,ts,tsx}', import.meta.url)),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
