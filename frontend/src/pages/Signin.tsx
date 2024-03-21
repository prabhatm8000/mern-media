import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../apiClient";

export type SigninFormDataType = {
    username: string;
    password: string;
    confirmPassword: string;
};

const Signin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninFormDataType>();

    const mutation = useMutation(apiClient.signin, {
        onSuccess: async () => {
            showToast({ type: "SUCCESS", message: "Sign In Success!" });
            await queryClient.invalidateQueries("validateToken");
            navigate("/edit-profile");
        },
        onError: (error: Error) => {
            showToast({ type: "ERROR", message: error.message });
        },
    });

    const onSubmit = handleSubmit((formData) => {
        mutation.mutate(formData);
    });

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-10"
            autoComplete="off"
        >
            <h2 className="text-3xl font-bold">Create an Account</h2>
            <div className="flex flex-col gap-5">
                <label className="text-neutral-200 text-sm font-bold flex-1">
                    Username
                    <input
                        className="bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-2 px-2 font-normal focus:outline-none"
                        type="text"
                        {...register("username", {
                            required: "This field is required",
                        })}
                    />
                    {errors.username && (
                        <span className="text-red-500 font-normal">
                            {errors.username.message}
                        </span>
                    )}
                </label>

                <label className="text-neutral-200 text-sm font-bold flex-1">
                    Password
                    <input
                        className="bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-2 px-2 font-normal focus:outline-none"
                        type="password"
                        {...register("password", {
                            required: "This field is required",
                            minLength: {
                                value: 6,
                                message:
                                    "Password must be at least 6 Characters long",
                            },
                        })}
                    />
                    {errors.password && (
                        <span className="text-red-500 font-normal">
                            {errors.password.message}
                        </span>
                    )}
                </label>

                <label className="text-neutral-200 text-sm font-bold flex-1">
                    Confirm Password
                    <input
                        className="bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-2 px-2 font-normal focus:outline-none"
                        type="password"
                        {...register("confirmPassword", {
                            validate: (val) => {
                                if (!val) {
                                    return "This field is required";
                                } else if (watch("password") !== val) {
                                    return "Your Passwords do not match";
                                }
                            },
                        })}
                    />
                    {errors.confirmPassword && (
                        <span className="text-red-500 font-normal">
                            {errors.confirmPassword.message}
                        </span>
                    )}
                </label>
            </div>

            <span className="flex items-center justify-between">
                <button
                    type="submit"
                    className="bg-amber-500 text-white p-2 font-bold rounded transition ease-in-out delay-150 hover:bg-amber-600 duration-300"
                >
                    Create Account
                </button>
                <span className="text-sm">
                    Already have an Account?{" "}
                    <Link to={"/"} className="underline text-blue-300">
                        Login
                    </Link>
                </span>
            </span>
        </form>
    );
};

export default Signin;
