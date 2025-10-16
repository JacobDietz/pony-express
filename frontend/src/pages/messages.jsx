import { useEffect, useRef, useContext, useState } from "react";
import { useLocation, useParams } from "react-router"
import { useMutation } from "@tanstack/react-query";

import { useChatMessages, useAccountName, useAccountsInChat } from "../queries";
import { AuthContext } from "../auth";
import { sendEditedMessage, sendMessage, sendDeleteMessage, joinChat } from "../api";
import { useJoinChatMutation, useSendMessageMutation } from "../mutations";


export default function MessagesContainer() {
    const { username, id } = useContext(AuthContext);
    const { chatId } = useParams();
    const { usernames } = useAccountsInChat(chatId);
    const { messages, refetch } = useChatMessages(chatId) || [];
    const [editedMessage, setEditedMessage] = useState(null);
    const divRef = useRef(null);
  
    useEffect(() => {
      divRef.current.scrollIntoView({ behavior: 'auto' });
    }, [messages]);
  
    return (
        <section className="flex flex-col bg-gray-400/30 border-1 border-blue-400 rounded-xl overflow-hidden"> 
        {/* Scrollable message area */}
        <div className="flex-1 overflow-y-auto px-4 mt-4">
          <ul className="space-y-4">
            {messages.map((msg) =>
              msg.account_id == id ? (
                <AccountOwnerMessage
                  key={msg.id}
                  account_id={msg.account_id}
                  chatId={msg.chat_id}
                  created_at={msg.created_at}
                  id={msg.id}
                  text={msg.text}
                  editedMessage={editedMessage}
                  setEditedMessage={setEditedMessage}
                  refetch={refetch}
                />
              ) : (
                <Message
                  key={msg.id}
                  account_id={msg.account_id}
                  chatId={msg.chat_id}
                  created_at={msg.created_at}
                  id={msg.id}
                  text={msg.text}
                />
              )
            )}
            <div ref={divRef} />
          </ul>
        </div>
      
        {/* Message input */}
        <div className="p-4 pt-2">
          <MessageInput
            chatId={chatId}
            accountsInChat={usernames}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
            refetch={refetch}
          />
        </div>
      </section>
      
    );
  }
  
function Message({ account_id, chatId, created_at, id, text }) {
    const { account } = useAccountName(account_id);
    const username = account?.username || "removed";


    const date = new Date(created_at).toLocaleString('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    return (
        <li className="mr-5 my-7 ml-3 mb-2 border-1 border-opacity-10 rounded-xl 
        hover:border-red-200 shadow-sm">
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <p className="ml-3 mt-2 font-medium text-blue-600">{username}</p>
                    <p className="ml-auto mt-2 text-gray-400 mr-3">{date}</p>
                </div>
                <p className="mt-4 ml-3 mb-3 text-xl text-gray-800">{text}</p>
            </div>
        </li>
    )
}


function AccountOwnerMessage({ account_id, chatId, created_at, id, text, editedMessage, setEditedMessage, refetch }) {
    const { headers } = useContext(AuthContext);
    const { account } = useAccountName(account_id);
    const [editToggle, setEditToggled] = useState(false);
    const username = account?.username || "removed";
    

    console.log(created_at);
    const date = new Date(created_at).toLocaleString('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    console.log(date);

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
                    {/* <p className="mt-4 ml-3 mb-3 text-gray-800">{text}</p> */}
                    <p className="mt-4 ml-3 mb-3 text-gray-800">{text}</p>
                </div>
            </li>
        )
    }
}


function MessageInput({ chatId, accountsInChat, refetch }) {
    const { username, id, headers } = useContext(AuthContext);
    const [memberOfChat, setMemberOfChat] = useState(accountsInChat.includes(username));
    const [message, setMessage] = useState("");
    const inputRef = useRef(null);
    const { mutate: joinChat } = useJoinChatMutation(headers, chatId, id, setMemberOfChat);
    const {mutate: sendMessage } = useSendMessageMutation(headers, message, chatId, id, setMessage, inputRef)

    useEffect(() => {
        setMemberOfChat(accountsInChat.includes(username));
    }, [chatId, accountsInChat])

    useEffect(() => {
        if (memberOfChat && inputRef.current) {
            inputRef.current.focus();
        }
    }, [memberOfChat]);

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    }
    const textBox = memberOfChat ? "focus:text-zinc-700 text-zinc-400 pl-1 py-1 w-full bg-stone-200 mt-1 ml-3 border rounded-md border-white focus:border-sky-200 focus:outline-none"
        : "invisible";
    const sendButton = (memberOfChat && !!message) ? "bg-sky-200 w-15 h-9 mt-1 ml-1 border border-white text-white rounded-md px-2 hover:bg-sky-300" : "hidden"

    if (memberOfChat) {

        return (
            <form className="" onSubmit={handleSubmit}>
                <div className="flex flex-row justify-end mr-5 ">
                    <input
                        value={message}
                        ref={inputRef}
                        type="text"
                        className={textBox}
                        onChange={(e) => {
                            setMessage(e.target.value);
                        }}
                        onFocus={(e) => {
                            // setFocused();
                            setMessage("");
                        }}
                        onBlur={(e) => {
                            setMessage("Enter a message");
                            //setEditToggled(false);
                            console.log("blur");
                        }}
                    ></input>
                    <input type="submit" value="Send" className={sendButton} disabled={!memberOfChat || !message} />
                </div>
            </form>
        )
    }
    else {
        return (
            <div className="flex flex-row mx-5 mt-2 bg-gray-200 rounded-md text-zinc-700">
            
              <p
              className="p-1"
              >Must be member of chat before you may send messages</p>
              <button
              className="bg-zinc-200 ml-auto border-2 rounded-md mr-20 px-3 hover:bg-zinc-200 hover:text-gray-600 hover:border-white shadow-xl"
            onClick={() => joinChat()}
              > join chat </button>
            </div>
        )
    }

}

