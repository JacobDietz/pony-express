import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { useEffect } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'


import { deleteAccount, updateAccount, updatePassword } from "../api/api";
import ChatNav from "../chats"
import { AuthContext } from "../auth";
import Login from "./login";



// function accountLoggedIn() {
//     const { loggedIn } = useContext(AuthContext);
//     return loggedIn === true;
// }

export default function Settings() {
    const { email, username, headers, logout, loggedIn } = useContext(AuthContext);

    // if (!(accountLoggedIn())) {
    //     return <Login url="/settings" />
    // }

    if (!loggedIn) {
        return <Login url="/settings" />
    }

    return (
        <div>
            <h1 className="text-center text-6xl font-extrabold text-zinc-300 mt-5">Settings</h1>
            <div class="flex flex-row h-3/4 min-w-3/4 max-w-4xl mx-auto">
                <ChatNav>

                </ChatNav>
                <div className="flex flex-col w-full">
                    <UpdateAccountSection username={username} email={email} headers={headers}>

                    </UpdateAccountSection>
                    <UpdatePasswordSection headers={headers}>

                    </UpdatePasswordSection>
                    <ManageAccount logout={logout} headers={headers}>

                    </ManageAccount>
                </div>
            </div>
        </div>
    )
};

function UpdateAccountSection({ username, email, headers }) {
    let [givenUsername, setUsername] = useState("");
    let [givenEmail, setEmail] = useState("");
    const { updateAccountInfo } = useContext(AuthContext);
    const [errorMsg, setErrorMsg] = useState(null);
    const errorClass = errorMsg ? "visible text-red-500 font-bold" : "hidden";

    const mutation = useMutation({

        mutationFn: () => updateAccount("/accounts/me", { username: givenUsername, email: givenEmail }, headers),
        onSuccess: (data) => handleSuccess(data),
        onError: (error) => handleError(error),
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        // Sanitize the values
        givenUsername = (givenUsername?.trim() === "" || givenUsername === username) ? null : givenUsername;
        givenEmail = (givenEmail?.trim() === "" || givenEmail == email) ? null : givenEmail;
        mutation.mutate();
    }
    const handleError = (error) => {
        setErrorMsg(error.message);
    }
    const handleSuccess = (data) => {
        updateAccountInfo(givenUsername, givenEmail);
        setUsername("");
        setEmail("");
    }

    return (
        // <section className="bg-stone-100 w-3/4 mx-5 border-1 rounded-xl mt-5 mb-5 border-zinc-300">
        <section className="bg-stone-100 w-3/4 border rounded-xl border-zinc-300 h-full mt-5 mb-5 p-2 ml-10 flex justify-center">
            <form id="loginForm" onSubmit={handleSubmit} className="flex flex-col w-50 mx-auto pt-5 flex shrink pb-5 align-items-center">
                <div className="flex flex-col align-center justify-center">
                    <p className={errorClass}>{errorMsg}</p>
                    <label className="text-slate-400">username
                        <input
                            autoFocus
                            defaultValue={username}
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            type="text"
                            onChange={(e) => {
                                setUsername(e.target.value);
                            }}
                        />
                    </label>

                    <label className="text-slate-400">email
                        <input
                            autoFocus
                            defaultValue={email}
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            type="text"
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                        />
                    </label>

                    <input
                        type="submit"
                        value="update account"
                        className="bg-blue-100 text-gray-500 rounded-xl w-full hover:text-white hover:bg-blue-200 mt-5 mx-auto block"
                    />
                </div>
            </form>

        </section>
    )
}


function UpdatePasswordSection({ headers }) {

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmedPassword, setConfirmedPasword] = useState("");
    const [disableButton, setButtonDisabled] = useState(true);

    //const { updateAccountInfo } = useContext(AuthContext);

    const [errorMsg, setErrorMsg] = useState(null);
    const errorClass = errorMsg ? "visible text-red-500 font-bold" : "hidden";

    useEffect(() => {
        (oldPassword.trim().length > 0 && newPassword.trim().length > 0 && confirmedPassword.trim().length > 0) ? setButtonDisabled(false)
            : setButtonDisabled(true);
    }, [oldPassword, newPassword, confirmedPassword])

    const mutation = useMutation({
        mutationFn: () => updatePassword({ "old_password": oldPassword, "new_password": newPassword }, headers),
        onSuccess: (data) => handleSuccess(data),
        onError: (error) => handleError(error),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    }
    const handleError = (error) => {
        // console.log("Error updating account");
        // console.log(error);
        setErrorMsg(error.message);
        // setNewPassword("");
        // setOldPassword("");
        // setConfirmedPasword("");
    }
    const handleSuccess = (data) => {
        setErrorMsg("success");
        setNewPassword("");
        setOldPassword("");
        setConfirmedPasword("");
    }

    return (
        // <section className="bg-stone-100 w-3/4 mx-5 border-1 rounded-xl border-zinc-300">
        <section className="bg-stone-100 w-3/4 border rounded-xl border-zinc-300 h-full mt-5 mb-5 p-2 ml-10 flex justify-center">
            <form id="loginForm" onSubmit={handleSubmit} className="flex flex-col w-50 mx-auto pt-5 flex shrink pb-5 align-items-center">
                <div className="flex flex-col align-center justify-center">
                    <p className={errorClass}>{errorMsg}</p>
                    <label className="text-slate-400">current password
                        <input
                            autoFocus
                            value={oldPassword}
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            type="text"
                            onChange={(e) => {
                                setOldPassword(e.target.value);
                            }}
                        />
                    </label>

                    <label className="text-slate-400">new password
                        <input
                            autoFocus
                            value={newPassword}
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            type="text"
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                            }}
                        />
                    </label>

                    <label className="text-slate-400">confirm new password
                        <input
                            autoFocus
                            value={confirmedPassword}
                            className="focus:outline border-2 border-red-200 rounded-lg"
                            type="text"
                            onChange={(e) => {
                                setConfirmedPasword(e.target.value);
                            }}
                        />
                    </label>


                    <input
                        type="submit"
                        value="update password"
                        disabled={disableButton}
                        className="bg-blue-100 text-slate-400 disabled:bg-gray-200 disabled:hover:text-slate-400 hover:text-white rounded-xl w-full hover:bg-blue-200 mt-5 mx-auto block"
                    />
                </div>
            </form>

        </section>
    )
}



function ManageAccount({ logout, headers }) {

    const [errorMsg, setErrorMsg] = useState(null);
    const errorClass = errorMsg ? "visible text-red-500 font-bold" : "hidden";

    const mutation = useMutation({
        mutationFn: () => deleteAccount(headers),
        onSuccess: (data) => logout(),
        onError: (error) => setErrorMsg("Unable to delete account. Account may be an owner of chat(s) or session expired")
    });

    const handleLogout = (e) => {
        e.preventDefault();
        console.log("Logging out");
        logout();
    }

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        console.log("Deleting account");
        mutation.mutate();
    }

    return (
        <section className="bg-stone-100 w-3/4 border rounded-xl border-zinc-300 h-full mt-5 mb-5 p-2 ml-10 flex justify-center">
            <div className="flex flex-col items-center w-3/4 h-3/4 p-3">
                <h1>{errorMsg}</h1>
                <button
                    className="bg-gray-300 tracking-tight text-gray-50 hover:text-white p-2 border border-gray-50 rounded-lg m-3 w-40 text-center hover:bg-gray-200"
                    onClick={handleLogout}
                >
                    logout
                </button>
                
                
                <button
                    className="bg-gray-300 tracking-tight text-gray-50 hover:text-white p-2 border border-gray-50 rounded-lg m-3 w-40 text-center hover:bg-gray-200"
                    onClick={handleDeleteAccount}
                >
                    delete account
                </button>
            </div>
        </section>
    );
}
function confirm() {
    return (
        <>
          <button onClick={() => setIsOpen(true)}>Open dialog</button>
          <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
              <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
                <DialogTitle className="font-bold">Deactivate account</DialogTitle>
                <Description>This will permanently deactivate your account</Description>
                <p>Are you sure you want to deactivate your account? All of your data will be permanently removed.</p>
                <div className="flex gap-4">
                  <button onClick={() => setIsOpen(false)}>Cancel</button>
                  <button onClick={() => setIsOpen(false)}>Deactivate</button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      )
    }
