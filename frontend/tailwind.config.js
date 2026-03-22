/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // VedaCare Brand Colors
                'deep-slate': {
                    DEFAULT: '#36565F',
                    50: '#E8ECEE',
                    100: '#D1D9DC',
                    200: '#A3B3B9',
                    300: '#758D96',
                    400: '#476773',
                    500: '#36565F',
                    600: '#2B454C',
                    700: '#203439',
                    800: '#162226',
                    900: '#0B1113',
                },
                'ocean-steel': {
                    DEFAULT: '#5F8190',
                    50: '#EDF2F4',
                    100: '#DBE5E9',
                    200: '#B7CBD3',
                    300: '#93B1BD',
                    400: '#6F97A7',
                    500: '#5F8190',
                    600: '#4C6773',
                    700: '#394D56',
                    800: '#263439',
                    900: '#131A1D',
                },
                'cloud-mist': {
                    DEFAULT: '#E2F0F0',
                    50: '#FFFFFF',
                    100: '#FFFFFF',
                    200: '#FFFFFF',
                    300: '#F8FCFC',
                    400: '#EDF6F6',
                    500: '#E2F0F0',
                    600: '#C5DCDC',
                    700: '#A8C8C8',
                    800: '#8BB4B4',
                    900: '#6EA0A0',
                },
                // Semantic colors
                'vedacare': {
                    primary: '#36565F',
                    secondary: '#5F8190',
                    light: '#E2F0F0',
                    dark: '#141414',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'vedacare': '0 4px 6px -1px rgba(54, 86, 95, 0.1), 0 2px 4px -1px rgba(54, 86, 95, 0.06)',
                'vedacare-lg': '0 10px 15px -3px rgba(54, 86, 95, 0.1), 0 4px 6px -2px rgba(54, 86, 95, 0.05)',
                'vedacare-xl': '0 20px 25px -5px rgba(54, 86, 95, 0.1), 0 10px 10px -5px rgba(54, 86, 95, 0.04)',
            },
            backgroundImage: {
                'gradient-vedacare': 'linear-gradient(135deg, #36565F 0%, #5F8190 100%)',
                'gradient-vedacare-light': 'linear-gradient(135deg, #E2F0F0 0%, #FFFFFF 100%)',
            },
        },
    },
    plugins: [],
}
