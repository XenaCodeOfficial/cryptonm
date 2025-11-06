import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nm-header': '#03366d',
        'nm-text-primary': '#f7f6f2',
        'nm-text-secondary': '#03366d',
        'nm-accent': '#ffde59',
        'nm-card-light': '#ffffff',
        'nm-card-dark': '#1a1a2e',
        'nm-bg-light': '#f5f5f5',
        'nm-bg-dark': '#0f0f1e',
      },
      backgroundImage: {
        'website': "url('/assets/images/bg-website.png')",
        'login': "url('/assets/images/bg-login.png')",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
