import { useContext, useState } from "react";
import { AuthContext } from "../auth";
import { useParams } from "react-router";

import Login from "../pages/login"
import ChatNav from "../components/chatComponents/ChatNav.jsx" //fix this to be from components
import { CreateChatPopUp } from "../components/CreateChatPopup.jsx";

import MessagesContainer from "../components/messageComponents/MessagesContainer.jsx";
const headerClassName = "text-5xl md:text-9xl text-center font-extrabold text-white text-outline my-none mb-none font-doto"



export default function Home() {
    const { loggedIn, logout } = useContext(AuthContext);
    const { params } = useParams();
    const [showPopup, setShowPopup] = useState(false);
  
    const click = () => {
      console.log("show pop val ", showPopup);
      setShowPopup(!showPopup);
    }
    if (!loggedIn) {
      return <Login />;
    }
    else {
      return (
         <div className="h-screen w-full flex flex-col">

          <h1 className={headerClassName}>Pony Express</h1>
          <div id="body" className="px:5 md:px-10 flex flex-1 overflow-hidden justify-evenly">
            <ChatNav onOpenCreateChat={click} />
            <MessagesContainer />
          </div>
          {showPopup &&
           <CreateChatPopUp className="w-[30svw] h-[30svh]"
           onClose={() => setShowPopup(false)} />
    }
        </div>
      );
    }
  }