import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../apiClient";
import { useAppContext } from "../contexts/AppContext";
import { BiLogOut } from "react-icons/bi";

const SignOutButton = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();

    const mutation = useMutation(apiClient.logout, {
        onSuccess: async () => {
            // to make validateToken query invalid, when signing out
            await queryClient.invalidateQueries("validateToken");
            showToast({ message: "Signed Out!", type: "SUCCESS" });
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "ERROR" });
        },
    });

    const handleClick = () => {
        mutation.mutate();
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center justify-center text-2xl p-1 rounded-full transition ease-in-out delay-150 hover:bg-amber-600 duration-300"
        >
            <BiLogOut className="translate-x-[-15%]" />
            {/* Logout */}
        </button>
    );
};

export default SignOutButton;
