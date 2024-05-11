import React, { useState } from "react";
import SideBar from "../components/SideBar";
interface LayoutProps {
    children: React.ReactNode;
}

const ColumnLayout = ({ children }: LayoutProps) => {
    const [showSideBar, setShowSideBar] = useState<boolean>(false);
    const handleShowSideBarBtn = () => {
        setShowSideBar((prev) => !prev);
    };
    const offScreenFade = () => {
        setShowSideBar(false);
    }
    return (
        <div className="md:grid md:grid-cols-[2fr_7fr] gap-2 overflow-hidden">
            <SideBar
                handleShowSideBarBtn={handleShowSideBarBtn}
                showSideBar={showSideBar}
                offScreenFade={offScreenFade}
            />
            <div className={`${showSideBar ? "backdrop-blur-md" : ""}`}>
                {children}
            </div>
        </div>
    );
};

export default ColumnLayout;
