import Footer from "../components/Footer";
import Header from "../components/Header";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-900 from-[25%]">
                <Header />
            </div>

            <div className="container mx-auto p-5 flex-1 relative">{children}</div>

            <div className="bg-gradient-to-r from-cyan-600 to-cyan-900 from-[25%]">
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
