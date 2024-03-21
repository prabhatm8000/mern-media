import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../apiClient";
import { useAppContext } from "../contexts/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    } = useForm<LoginFormData>();

    const mutation = useMutation(apiClient.login, {
        onSuccess: async () => {
            showToast({ message: "Sign in Successfull!", type: "SUCCESS" });
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
        mutation.mutate(formData);
    });

    return (
        <form className="flex flex-col gap-5 " onSubmit={onSubmit} autoComplete="off">
            <h2 className="text-3xl font-bold">Login</h2>

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
            </div>

            <span className="flex items-center justify-between">
                <button
                    type="submit"
                    className="bg-amber-500 text-white p-2 font-bold rounded transition ease-in-out delay-150 hover:bg-amber-600 duration-300"
                >
                    Login
                </button>
                <span className="text-sm">
                    Don't have an Account?{" "}
                    <Link to={"/sign-in"} className="underline text-blue-300">
                        Create one
                    </Link>
                </span>
            </span>
        </form>
    );
};

export default Login;
