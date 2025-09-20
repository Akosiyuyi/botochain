import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // 👈 enable dark mode via class

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './node_modules/@inertiaui/modal-react/src/**/*.{js,jsx}',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-out forwards',
            },
        },
    },

    safelist: [
        {
            pattern: /^(dark:)?bg-(blue|green|yellow|red)-(50|900)$/,
        },
        {
            pattern: /^(dark:)?border-(blue|green|yellow|red)-500$/,
        },
        {
            pattern: /^(dark:)?text-(blue|green|yellow|red)-(800|700|300|200)$/,
        },
        // Arbitrary value classes must be listed explicitly
        'dark:bg-blue-900/30',
        'dark:bg-green-900/30',
        'dark:bg-yellow-900/30',
        'dark:bg-red-900/30',
    ],

    plugins: [forms],
};
