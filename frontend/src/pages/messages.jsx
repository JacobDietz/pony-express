import { useEffect, useRef, useContext, useState } from "react";
import { useLocation, useParams } from "react-router"

import { useChatMessages, useAccountName, useAccountsInChat } from "../queries";
import { AuthContext } from "../auth";
import { useJoinChatMutation, useSendMessageMutation } from "../mutations";
import MessageInput from "../components/MessageInput";
import AccountOwnerMessage from "../components/messageComponents/OwnerMessage";

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
    const [editedMessage, setEditedMessage] = useState(null);
    const divRef = useRef(null);
  
    useEffect(() => {
      divRef.current.scrollIntoView({ behavior: 'auto' });
    }, [messages]);
  
    return (
        <section className="flex w-2/3 h-95/100 flex-col bg-gradient-to-b from-gray-300 to-slate-300 border-1 border-blue-400 rounded-xl "> 
                {/* Scrollable message area */}
        <div className="flex-1 overflow-y-auto px-4 mt-4 md:px-4 md:mt-4">
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
        <li className=" border-1 border-opacity-10 rounded-xl 
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
