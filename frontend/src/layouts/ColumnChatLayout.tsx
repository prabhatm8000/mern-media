import React from "react";
import SideBarChat from "../components/SideBarChat";
interface LayoutProps {
    showSideBar: boolean;
    showMainPage: boolean;
    children: React.ReactNode;
}

const ColumnChatLayout = ({
    children,
    showMainPage,
    showSideBar,
}: LayoutProps) => {
    return (
        <div className="md:grid md:grid-cols-[4fr_6fr] gap-2 overflow-hidden">
            <div className={`${showSideBar ? "block" : "hidden"} md:block`}>
                <SideBarChat />
            </div>
            <div className={`${showMainPage ? "block" : "hidden"} md:block`}>
                {children}
            </div>
        </div>
    );
};

export default ColumnChatLayout;
