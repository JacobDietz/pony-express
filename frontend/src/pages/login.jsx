import { useContext, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { postLoginForm } from "../api";
import { AuthContext } from "../auth";



export default function Login( {url="/"}) {
    const [inputsEntered, setInputsEntered] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);
    const {login} = useContext(AuthContext);
    const navigate = useNavigate();

    const errorClass = errorMsg ? "visible text-red-500 font-bold" : "hidden";

    const mutation = useMutation({
        mutationFn: () => postLoginForm("/auth/token", { username, password }),
        onSuccess: (data) => handleSuccess(data),
        onError: (error) => handleError(error),
    });

    useEffect(() => {
        setInputsEntered(username.length > 0 && password.length > 0);
    }, [username, password])

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    }

    const handleSuccess = (data) => {
        login(data.access_token, username);
        navigate(url);
    };

    const handleError = (error) => {
        setErrorMsg(error.message),
        setPassword("");
    };
    const loginButtonInputsGiven = "inset-shadow-md inset-shadow-indigo-800 font-medium bg-gray-100 hover:text-blue-300 opacity-100 mt-5 w-1/2 border-none rounded-md border-blue-200 mx-auto shadow-xl text-center mb-5 hover:bg-neutral-100 hover:border-red-100"

    const loginButtonBackground = inputsEntered
        ? loginButtonInputsGiven
        : "font-medium opacity-50 mt-5 w-1/2 border-2 rounded-md border-blue-100 mx-auto shadow-xl text-center mb-5";
    return (
        <div>
            <h1 className="text-center text-6xl font-extrabold py-4 text-stone-200 text-shadow-lg">Pony Express</h1>
            <section className="bg-stone-200 w-1/3 mx-auto rounded-lg shrink drop-shadow-2xl  backdrop-blur-2xl">
                <form id="loginForm" onSubmit={handleSubmit} className="text-slate-500 flex flex-col w-50 mx-auto pt-5 flex shrink">
                    {/* <p className={errorClass}>Invalid Username or Password</p> */}
                    <p className={errorClass}>{errorMsg}</p>
                    <label>username
                        <input
                            autoFocus
                            className="focus:border-red-300 border-2 border-red-200 rounded-lg shrink outline-none "
                            type="text"
                            onChange={(e) => {
                                setUsername(e.target.value.trim());
                            }}
                        />
                    </label>

                    <label>password
                        <input
                            className="focus:border-red-300 border-2 border-red-200 rounded-lg shrink outline-none "
                            value={password}
                            type="password"
                            onChange={(e) => {
                                setPassword(e.target.value.trim());
                            }}
                        />
                    </label>
                    <input type="submit" disabled={!inputsEntered} className={loginButtonBackground}/>
                    <a href="/register" className="w-m mx-auto text-sky-300 font-medium hover:text-sky-800 mb-2 flex justify-center">Register New Account</a>
                </form>
            </section>
        </div>
    );
}

export { Login };