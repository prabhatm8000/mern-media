interface FadeBGProps {
    onClick?: () => void;
}
const FadeBG = ({ onClick }: FadeBGProps) => {
    return (
        <div
            onClick={onClick}
            style={{
                backdropFilter: "blur(2px)",
            }}
            className="fixed h-screen w-screen bg-black/50 top-0 left-0 z-20 inset-0"
        ></div>
    );
};

export default FadeBG;
