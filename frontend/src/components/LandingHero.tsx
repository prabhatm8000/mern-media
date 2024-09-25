const LandingHero = () => {
    return (
        <div className="relative mt-20 md:pb-48 flex flex-col justify-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl text-center font-bloodySunday mb-4">
                MernMedia
            </h1>

            <p>
                <span className="font-semibold">Welcome to MernMedia</span>, a
                social media platform that values your experience. Engage with
                others, share posts, and explore profiles. Our real-time chat
                and advanced search features make connecting easy. Join
                MernMedia today for a unique social media journey.
            </p>

            <a
                href="#login"
                className="hidden mb-6 relative w-fit px-4 py-2 font-bold text-lg overflow-hidden transition-all bg-blue-600 rounded-full hover:bg-white group"
            >
                Login
            </a>
        </div>
    );
};

export default LandingHero;
