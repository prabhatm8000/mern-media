import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import * as apiClient from "../apiClient";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import { useAppContext } from "../contexts/AppContext";

export type SigninFormDataType = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const Signin = ({
    setFormType,
}: {
    setFormType: (formType: "login" | "signin") => void;
}) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SigninFormDataType>();

    const { mutate, isLoading } = useMutation(apiClient.signin, {
        onSuccess: async () => {
            showToast({
                type: "SUCCESS",
                message: `Account created successfull! Hello, ${watch(
                    "username"
                )} 👋🏽`,
            });
            await queryClient.invalidateQueries("validateToken");
            navigate("/edit-profile");
        },
        onError: (error: Error) => {
            showToast({ type: "ERROR", message: error.message });
        },
    });

    const onSubmit = handleSubmit((formData) => {
        mutate(formData);
    });

    return (
        <form
            className="max-w-[320px] h-fit px-10 py-6 rounded-2xl border border-whiteAlpha2 shadow-lg hover:shadow-black2 transition-shadow delay-75 duration-500"
            onSubmit={onSubmit}
            autoComplete="off"
        >
            <h2 className="text-3xl lg:text-5xl text-center mb-6">Sign in</h2>

            <div className="space-y-2 mb-6">
                <input
                    placeholder="Username"
                    className={`bg-black1 text-sm border rounded ${
                        errors.username
                            ? "border-red-500"
                            : "border-whiteAlpha2"
                    } w-full py-2 px-3 focus:outline-none focus:border-blue-500 placeholder:text-whiteAlpha1`}
                    type="text"
                    {...register("username", {
                        required: "This field is required",
                        pattern: {
                            message: "Whitespace and period are not allowed",
                            value: /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/,
                        },
                    })}
                    onBlur={(e) => {
                        // Trim whitespace on blur
                        const trimmedValue = e.target.value.trim();
                        setValue("username", trimmedValue, {
                            shouldValidate: true,
                        });
                    }}
                />
                {errors.username && (
                    <span className="text-red-500 text-sm">
                        *{errors.username.message}
                    </span>
                )}

                <input
                    placeholder="Email"
                    className={`bg-black1 text-sm border rounded ${
                        errors.email ? "border-red-500" : "border-whiteAlpha2"
                    } w-full py-2 px-3 focus:outline-none focus:border-blue-500 placeholder:text-whiteAlpha1`}
                    type="text"
                    {...register("email", {
                        required: "This field is required",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                        },
                    })}
                    onBlur={(e) => {
                        // Trim whitespace on blur
                        const trimmedValue = e.target.value.trim();
                        setValue("email", trimmedValue, {
                            shouldValidate: true,
                        });
                    }}
                />
                {errors.email && (
                    <span className="text-red-500 text-sm">
                        *{errors.email.message}
                    </span>
                )}

                <input
                    className={`bg-black1 text-sm border rounded ${
                        errors.password
                            ? "border-red-500"
                            : "border-whiteAlpha2"
                    } w-full py-2 px-3 focus:outline-none focus:border-blue-500 placeholder:text-whiteAlpha1`}
                    type="password"
                    placeholder="Password"
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
                    <span className="text-red-500 text-sm">
                        *{errors.password.message}
                    </span>
                )}

                <input
                    className={`bg-black1 text-sm border rounded ${
                        errors.confirmPassword
                            ? "border-red-500"
                            : "border-whiteAlpha2"
                    } w-full py-2 px-3 focus:outline-none focus:border-blue-500 placeholder:text-whiteAlpha1`}
                    type="password"
                    placeholder="Confirm Password"
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
                    <span className="text-red-500 text-sm">
                        *{errors.confirmPassword.message}
                    </span>
                )}
            </div>

            <button
                className="mb-6 relative w-full items-center justify-start inline-block px-2 py-1 overflow-hidden font-medium transition-all bg-blue-600 rounded-full hover:bg-white group"
                type="submit"
            >
                <span className="absolute inset-0 border-0 group-hover:border-[25px] ease-linear duration-100 transition-all border-white rounded-full"></span>
                <span className="relative w-full font-semibold text-sm text-white transition-colors duration-300 ease-in-out group-hover:text-blue-600">
                    <span className="flex justify-center items-center gap-1">
                        {isLoading && <LoadingCircleSvg className="size-5" />}
                        {isLoading ? "Please Wait..." : "Create Account"}
                    </span>
                </span>
            </button>

            <div className="text-sm text-center mb-6">
                {"Have an account? "}
                <span
                    className="underline text-blue-300 cursor-pointer"
                    onClick={() => setFormType("login")}
                >
                    Login
                </span>
            </div>
        </form>
    );
};

export default Signin;
