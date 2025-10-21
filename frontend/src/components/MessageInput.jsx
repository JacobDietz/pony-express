
import { useContext } from "react";
import { AuthContext } from "../auth";
import { useState, useRef, useEffect  } from "react";
import { useJoinChatMutation, useSendMessageMutation } from "../data/mutations/mutations";

// should put     const [memberOfChat, setMemberOfChat] = useState(accountsInChat.includes(username));
// as state in messageContainer along with accounts in Chat

export default function MessageInput({ chatId, accountsInChat, refetch, memberOfChat}) {
    const { username, id, headers } = useContext(AuthContext);
   // const [memberOfChat, setMemberOfChat] = useState(accountsInChat.includes(username));
    const [isChatMember, setMemberOfChat] = useState(memberOfChat); 
    const [message, setMessage] = useState("");
    const inputRef = useRef(null);
    const { mutate: joinChat } = useJoinChatMutation(headers, chatId, id, setMemberOfChat);
    const {mutate: sendMessage } = useSendMessageMutation(headers, message, chatId, id, setMessage, inputRef)

    // useEffect(() => {
    //     setMemberOfChat(accountsInChat.includes(username));
    // }, [chatId, accountsInChat])

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
