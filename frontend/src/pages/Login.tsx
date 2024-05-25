import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as apiClient from "../apiClient";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import { useAppContext } from "../contexts/AppContext";

export type LoginFormData = {
    username: string;
    password: string;
};

const Login = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useAppContext();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<LoginFormData>();

    const { mutate, isLoading } = useMutation(apiClient.login, {
        onSuccess: async () => {
            showToast({
                message: `Login successfull! Hello, ${watch("username")} 👋🏽`,
                type: "SUCCESS",
            });
            await queryClient.invalidateQueries("validateToken");

            // got request for login from other locations (like from, login to book)
            // if we have a loaction, go there
            // else goto home page
            navigate(location.state?.from?.pathname || "/home");
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "ERROR" });
        },
    });

    const onSubmit = handleSubmit((formData) => {
        mutate(formData);
    });

    return (
        <div className="flex justify-center items-center h-screen select-none">
            <form
                className="max-w-[320px] h-fit px-10 py-8 rounded border border-whiteAlpha2 shadow-lg hover:shadow-black2 transition-shadow delay-75 duration-500"
                onSubmit={onSubmit}
                autoComplete="off"
            >
                <h2 className="text-5xl text-center mb-10 font-bloodySunday">
                    MernMedia
                </h2>

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
                            required: "Username is required",
                            pattern: {
                                value: /^\S*$/,
                                message: "Whitespace is not allowed",
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
                        placeholder="Password"
                        className={`bg-black1 text-sm border rounded ${
                            errors.password
                                ? "border-red-500"
                                : "border-whiteAlpha2"
                        } w-full py-2 px-3 focus:outline-none focus:border-blue-500 placeholder:text-whiteAlpha1`}
                        type="password"
                        {...register("password", {
                            required: "Password is required",
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
                </div>

                <button
                    className="mb-6 relative w-full items-center justify-start inline-block px-2 py-1 overflow-hidden font-medium transition-all bg-blue-600 rounded-full hover:bg-white group"
                    type="submit"
                >
                    <span className="absolute inset-0 border-0 group-hover:border-[25px] ease-linear duration-100 transition-all border-white rounded-full"></span>
                    <span className="relative w-full font-semibold text-sm text-white transition-colors duration-300 ease-in-out group-hover:text-blue-600">
                        <span className="flex justify-center items-center gap-1">
                            {isLoading && (
                                <LoadingCircleSvg className="size-5" />
                            )}
                            {isLoading ? "Please Wait..." : "Login"}
                        </span>
                    </span>
                </button>

                <div className="mb-6 text-sm text-center">
                    {"Don't have an Account? "}
                    <Link to={"/sign-in"} className="text-blue-300">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
