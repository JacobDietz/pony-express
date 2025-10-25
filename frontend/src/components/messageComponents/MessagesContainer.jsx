import { useEffect, useRef, useContext, useState } from "react";
import { useParams } from "react-router"

import { useChatMessages, useAccountName, useAccountsInChat } from "../../data/queries/queries.js";
import { AuthContext } from "../../auth.jsx";
import MessageInput from "./MessageInput.jsx";
import AccountOwnerMessage from "./OwnerMessage.jsx"


// glass effect 
//<div class="isolate aspect-video w-96 rounded-xl bg-white/20 shadow-lg ring-1 ring-black/5">

/**
 * Container for all the messages in a chat
 * Also stores the input bar for writing messages, and separate components for 
 * messages that are owned by the owner and messages sent by other accounts. 
 */

export default function MessagesContainer() {
  const { username, id } = useContext(AuthContext);
  const { chatId } = useParams();
  const { usernames } = useAccountsInChat(chatId);
  const { messages, refetch } = useChatMessages(chatId) || [];

  const [memberOfChat, setMemberOfChat] = useState(usernames.includes(username));
  const [editedMessage, setEditedMessage] = useState(null);
  const divRef = useRef(null);


  let viewableMessagesClass = memberOfChat ? "relative flex-1 bg-gray-400/40 overflow-y-auto px-4 md:px-4 z-40" :
    "flex-1 bg-white/10 blur-sm overflow-hidden px-4 md:px-4 z-20  "


  useEffect(() => {
    setMemberOfChat(usernames.includes(username));
  }, [chatId, usernames])

  useEffect(() => {
    divRef.current.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  return (
    // <section className="flex w-2/3 h-95/100 flex-col bg-gradient-to-b from-gray-300 to-slate-300 border-1 border-blue-400 rounded-xl "> 
    <section className="relative flex w-2/3 h-95/100 flex-col bg-white/20 shadow-lg ring-1 ring-black/10 border-1 border-blue-400 rounded-xl">
      <NonMemberPopUp setVisible={memberOfChat}></NonMemberPopUp>
      {/* <section className="flex w-2/3 h-95/100 flex-col bg-white/20 shadow-lg ring-1 ring-black/10 border-1 border-blue-400 rounded-xl "> 
       <section className={`${viewableMessagesClass}`}> */}
      {/* Scrollable message area */}
      <div id="viewableMessagesClass" className={`${viewableMessagesClass}`}>
        <ul className="space-y-4 z-10">
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
      <div className="p-4 pt-2">
        <MessageInput
          chatId={chatId}
          memberOfChat={memberOfChat}
          editedMessage={editedMessage}
          setEditedMessage={setEditedMessage}
          refetch={refetch}
        />
      </div>
    </section>
  );
}

function Message({ account_id, created_at, id, text }) {
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
    <li className=" border-1 border-jopacity-10 rounded-xl 
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

function NonMemberPopUp({setVisible}){

  let isVisible = setVisible ? "invisible" : ""; 
  return (
    <div id="nonMemberPopUp" className={`${isVisible} flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg z-50 h-1/3 w-1/2 bg-slate-200/40 ring-1 ring-blue-500/10`}>
      <p className="text-lg md:text-xl text-white font-semibold font-ubuntu">Must be member of chat </p>
    </div>
  )

}
