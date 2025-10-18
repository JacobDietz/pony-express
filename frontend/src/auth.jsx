

import { createContext, useState } from "react";
import { get } from "./api/api";

const AuthContext = createContext();
const TOKEN_KEY = "pony_express_token";

export default function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY)); // get token from local storage (provided by browsers)
    const [username, setUsername] = useState(() => localStorage.getItem("username") || "error");
    const [email, setEmail] = useState(() => localStorage.getItem("email") || "error");
    const [id, setId] = useState(() => localStorage.getItem("id") || "error");


    const loggedIn = !!token; // truthy val, not null means true
    const headers = { Authorization: `Bearer ${token}` };


    const login = async (token, name) => {
        const loginHeaders = { Authorization: `Bearer ${token}` };
        const data = await get("/accounts/me", loginHeaders);
        const { email, id } = data;

        setToken(token);  // sets loggedIn to true
        setUsername(name);
        setEmail(email);
        setId(id);

        localStorage.setItem("email", email);
        localStorage.setItem("username", name);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem("id", id);

    };

    const logout = () => {
        setUsername("");
        setToken(null); // sets loggedIn to false
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("email");
        localStorage.removeItem("username");
    };
    const updateAccountInfo = (newName, newEmail) => {
        if (!!newName) {
            setUsername(newName);
            localStorage.setItem("username", newName);
        } 
        if (!!newEmail) {
           setEmail(newEmail);
           localStorage.setItem("email", newEmail);
        }
    };

    return (
        <AuthContext.Provider value={{ headers, loggedIn, username, email, login, logout, updateAccountInfo, id }}>
            {children}
        </AuthContext.Provider>
    );
}



export { AuthContext };

