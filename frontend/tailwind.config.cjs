/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                glass: {
                    surface: "rgba(15, 23, 42, 0.4)", // Dark Slate
                    border: "rgba(56, 189, 248, 0.2)", // Sky Blue border
                    shine: "rgba(56, 189, 248, 0.4)",
                }
            }
        },
    },
    plugins: [],
}
