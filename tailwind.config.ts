import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 10s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'pulse-slower': 'pulse-slow 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.3' },
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#4B5563', // Gray-600
            maxWidth: 'none',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            p: {
              marginTop: '0',
              marginBottom: '0.5em',
              lineHeight: '1.5',
            },
            'ul, ol': {
              marginTop: '0',
              marginBottom: '0.5em',
              paddingLeft: '1em',
            },
            li: {
              marginTop: '0',
              marginBottom: '0.25em',
              fontSize: '0.875rem',
            },
            'h1, h2, h3': {
              marginTop: '1em',
              marginBottom: '0.5em',
              lineHeight: '1.3',
              color: '#374151', // Gray-700
              fontWeight: '500',
            },
            strong: {
              fontWeight: '500',
              color: '#374151', // Gray-700
            },
            code: {
              color: '#374151', // Gray-700
              backgroundColor: '#F3F4F6', // Gray-100
              padding: '0.2em 0.4em',
              borderRadius: '0.25em',
              fontSize: '0.75em',
              fontWeight: '400',
            },
            pre: {
              backgroundColor: '#F9FAFB', // Gray-50
              padding: '0.75em',
              borderRadius: '0.375em',
              border: '1px solid #E5E7EB', // Gray-200
              overflow: 'auto',
            },
            a: {
              color: '#2563EB', // Blue-600
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }
          }
        },
        xs: {
          css: {
            fontSize: '0.75rem',
          }
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
};

export default config;
