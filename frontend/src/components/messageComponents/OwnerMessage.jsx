import { useMutation } from "@tanstack/react-query";
import { AuthContext } from "../../auth";
import { useContext, useState } from "react";
import { useAccountName } from "../../queries";
import { sendEditedMessage, sendMessage, sendDeleteMessage, joinChat } from "../../api";

export default function AccountOwnerMessage({ account_id, chatId, created_at, id, text, editedMessage, setEditedMessage, refetch }) {
    const { headers } = useContext(AuthContext);
    const { account } = useAccountName(account_id);
    const [editToggle, setEditToggled] = useState(false);
    const username = account?.username || "removed";
    
    const date = new Date(created_at).toLocaleString('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    const editMessageMutation = useMutation({
        mutationFn: () =>
            sendEditedMessage(headers, editedMessage, chatId, id),
        onSuccess: (e) => {
            setEditedMessage("");
            refetch();
        },
    });

    const deleteMessageMutation = useMutation({
        mutationFn: () =>
            sendDeleteMessage(headers, chatId, id),
        onSuccess: (e) => {
            console.log("SUCCESSFULLY DELETED");
            setEditedMessage("");
            refetch();
        },
    });

    const edit = () => {
        setEditToggled(true);
        setEditedMessage(text);
    }

    const deleteMessage = () => {
        console.log("Deleting message");
        deleteMessageMutation.mutate();
    }
    const cancel = () => {
        setEditToggled(false);
    }
    const save = () => {
        editMessageMutation.mutate();
    }
    const focusLeft = () => {
        console.log("left foucs");
        setEditToggled(false);
    }

    if (editToggle) {
        return (
            <li className="mr-5 my-7 ml-3 mb-2 border-1 border-opacity-10 rounded-xl 
            hover:border-red-200 shadow-sm">
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <p className="ml-3 mt-2 font-medium text-blue-600">{username}</p>
                        <p className="ml-auto mt-2 text-gray-400 mr-3">{date}</p>
                    </div>
                    <div className="flex flex-row">
                        <button className="border border-gray-300 text-gray-500 text-sm rounded-md mt-1 ml-auto mr-2 w-1/10 hover:bg-gray-200 hover:text-white"
                            onClick={save}
                        >Save</button>

                        <button className="border border-gray-300 text-gray-500 text-sm px-1 rounded-md mt-1 mr-2 hover:bg-gray-200 hover:text-white"
                            onClick={cancel}
                        >Cancel</button>
                    </div>
                    <form>
                        <input
                            autoFocus
                            className="mt-4 ml-3 mb-3 bg-gray-100 rounded-md border-white border pr-10 outline-none w-5/6"
                            value={editedMessage}
                            onChange={(e) => {
                                setEditedMessage(e.target.value);
                            }}
                            onBlur={() => {
                                setTimeout(focusLeft, 150);
                            }}
                        >
                        </input>
                    </form>
                </div>
            </li>
        )
    }
    else {
        return (
            <li className="mr-5 my-7 ml-3 mb-2 border-1 border-opacity-10 rounded-xl 
            hover:border-red-200 shadow-sm">
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <p className="ml-3 mt-2 font-medium text-blue-600">{username}</p>
                        <p className="ml-auto mt-2 text-gray-400 mr-3">{date}</p>
                    </div>
                    <div className="flex flex-row">
                        <button className="border border-gray-300 text-gray-500 text-sm rounded-md mt-1 ml-auto mr-2 w-1/10 hover:bg-gray-200 hover:text-white"
                            onClick={edit}
                        >Edit</button>

                        <button className="border border-gray-300 text-gray-500 text-sm rounded-md mt-1 mr-2 px-1 hover:bg-gray-200 hover:text-white"
                            onClick={deleteMessage}
                        >Delete</button>
                    </div>
                    <p className="mt-4 ml-3 mb-3 text-gray-800">{text}</p>
                </div>
            </li>
        )
    }
}
