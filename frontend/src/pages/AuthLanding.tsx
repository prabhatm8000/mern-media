import { useState } from "react";
import LandingHero from "../components/LandingHero";
import Login from "./Login";
import Signin from "./Signin";

const AuthLanding = () => {
    const [formType, setFormType] = useState<"login" | "signin">("login");

    return (
        <div className="h-screen select-none px-4">
            <div className="relative grid grid-cols-1 md:grid-cols-2 justify-center items-center h-[calc(100vh-25px)]">
                <LandingHero />

                <div className="flex justify-center md:items-center relative h-[calc(100vh-64px)]">
                    <div
                        className="xl:mt-0 mt-20 flex flex-col md:item-center justify-center"
                        id="login"
                    >
                        <div className="mb-10 space-y-6 w-fit">
                            <h3 className="text-5xl font-bold w-fit">
                                Happening now
                            </h3>
                            <h5 className="text-3xl font-bold w-fit">
                                Join today.
                            </h5>
                        </div>

                        {formType === "login" && (
                            <Login setFormType={setFormType} />
                        )}
                        {formType === "signin" && (
                            <Signin setFormType={setFormType} />
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full fixed left-0 bottom-0 border-t border-whiteAlpha2 bg-black">
                <p className="text-white/60 text-sm text-center md:text-start px-4">
                    Copyright © 2024 MernMedia. All rights reserved
                </p>
            </div>
        </div>
    );
};

export default AuthLanding;
