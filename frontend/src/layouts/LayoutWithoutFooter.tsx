import Header from "../components/Header";
import "../Marquee.css"

interface LayoutWithoutFooterProps {
    children: React.ReactNode;
}

const LayoutWithoutFooter = ({ children }: LayoutWithoutFooterProps) => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-900 from-[25%]">
                <Header />
            </div>
            <div className="container mx-auto p-5 flex-1 relative">
                {children}
                {/* <div className="fixed z-[100] w-full top-[0%]">
                    <div className="marquee-container w-96">
                        <div className="marquee">
                            <p className="text-3xl w-fit">Demo deployment</p>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default LayoutWithoutFooter;
