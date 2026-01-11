/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                nature: {
                    50: '#f2fcf5',
                    100: '#e1f8e8',
                    500: '#10b981',
                    600: '#059669',
                    900: '#064e3b',
                },
                classic: {
                    gold: '#d4af37',
                    cream: '#fcfbf7',
                    slate: '#0f172a',
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
