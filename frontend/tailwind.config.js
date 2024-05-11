/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "media",
    theme: {
        extend: {
            colors: {
                white1: '#FAF4F4',
                white2: '#F9F4F4',
                white3: '#A9A4A4',
                whiteAlpha1: '#FAF4F480',
                whiteAlpha2: '#F9F4F430',
                black1: '#1a1a1a',
                black2: '#1f1f1f',
            },
            width: {
                post: "clamp(15.625rem, 5.681818181818182rem + 49.71590909090909vw, 37.5rem)",
                postImage: "clamp(15.5rem, 8.212707182320443rem + 44.19889502762431vw, 36.5rem)",
                postLg: "600px",
                postImageLg: "584px",
            },
            height: {
                postImage: "clamp(12.375rem, 6.1595303867403315rem + 33.14917127071823vw, 27.375rem)",
                postImageLg: "438px",
            },
            fontFamily: {
                bloodySunday: ["bloodySunday"],
                "poppins-light": ["poppins-light"],
                "poppins-bold": ["poppins-bold"]
            }
        },
        container: {
            // padding: '1rem'
        }
    },
    plugins: [],
}
