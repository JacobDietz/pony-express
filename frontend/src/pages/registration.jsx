import { useState, useEffect, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { registrationForm } from "../api";
import { AuthContext } from "../auth";
import { postLoginForm } from "../api";

/**
 * Registration Component
 *
 * Renders a registration form that collects a username, email, password, and a confirmation password.
 * 
 * @returns {JSX.Element} The registration form component.
 */
export default function Registration() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [inputsEntered, setInputsEntered] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const {login, logout, loggedIn} = useContext(AuthContext);
    const navigate = useNavigate();

    if(loggedIn) {
        console.log("Logged in account can't register for new account");
        logout();
    }

    useEffect(() => {
        setInputsEntered((username.length > 0 && password.length > 0 
            && email.length > 0 && confirmedPassword.length > 0) && password === confirmedPassword);
            (password !== confirmedPassword && confirmedPassword.length > 0) ? 
               setErrorMsg("Confirmed password does not equal password") : setErrorMsg(null);

    }, [username, email, password, confirmedPassword])

    const mutation = useMutation({
        mutationFn: () => registrationForm("/auth/registration", { username, email, password }),
        onSuccess: (data) => handleSuccess(data),
        onError: (error) => handleError(error),
    });

    const loginMutation = useMutation({
        mutationFn: () => postLoginForm("/auth/token", { username, password }),
        onSuccess: (data) => handleLoginSuccess(data),
        onError: (error) => setErrorMsg("Error logging in"),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
     }

    const handleSuccess = (data) => { 
        loginMutation.mutate();
    }

    const handleError = (error) => { 
        // console.log(error);
        setErrorMsg("Account with username or email already exist");
    }

    const handleLoginSuccess = (data) => { 
        login(data.access_token, username);
        navigate("/chats");
    }

    const errorClass = errorMsg ? "visible text-red-500 font-bold" : "hidden";
    const loginButtonBackground = inputsEntered
        ? "font-medium opacity-100 mt-5 w-1/2 border-2 rounded-lg border-red-300 mx-auto shadow-xl text-center mb-5 hover:bg-neutral-200 hover:border-red-900"
        : "font-medium opacity-50 mt-5 w-1/2 border-2 rounded-lg border-red-300 mx-auto shadow-xl text-center mb-5";

    return (
        <div>
            <h1 className="text-center text-6xl font-extrabold py-4 text-blue-200 text-shadow-lg">Pony Express</h1>
            <section className="bg-slate-50 w-1/3 mx-auto rounded-lg shrink drop-shadow-2xl">
                <form id="loginForm" onSubmit={handleSubmit} className="flex flex-col w-50 mx-auto pt-5 flex shrink">
                    <p className={errorClass}>{errorMsg}</p>
                    <label className="text-slate-400">username
                        <input
                            autoFocus
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            type="text"
                            onChange={(e) => {
                                setUsername(e.target.value);
                            }}
                        />
                    </label>

                    <label className="text-slate-400">email
                        <input
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            value={email}
                            type="text"
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                        />
                    </label>

                    <label className="text-slate-400">password
                        <input
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            value={password}
                            type="text"
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                        />
                    </label>

                    <label className="text-slate-400">confirm password
                        <input
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            value={confirmedPassword}
                            type="text"
                            onChange={(e) => {
                                setConfirmedPassword(e.target.value);
                            }}
                        />
                    </label>
                    <input type="submit" value="register" disabled={!inputsEntered} className={loginButtonBackground} />
                    <a href="/" className="w-m mx-auto text-sky-300 font-medium hover:text-sky-800 mb-2 flex justify-center">Login to existing account</a>
                </form>
            </section>
        </div>
    );
}