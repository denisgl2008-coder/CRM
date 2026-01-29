/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563eb', // Blue 600
                    light: '#3b82f6',
                    dark: '#1d4ed8',
                },
                background: '#fdfbf7', // Cream/Bone
                surface: '#ffffff',
                accent: {
                    green: '#22c55e',
                    blue: '#3b82f6',
                }
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
