import { BrowserRouter, Routes, Route, useParams } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import ChatNav from "./chats"
import MessagesContainer from "./pages/messages.jsx"
import AuthProvider from "./auth";
import Login from "./pages/login"
// import Settings from "./pages/settings";
import Settings from "./pages/settings";

import { AuthContext } from "./auth";
import Registration from "./pages/registration";
import { useContext, useState } from 'react';

import { CreateChatPopUp } from "./chats";


const headerClassName = "text-xl sm:text-9xl text-center font-extrabold text-white text-outline my-none mb-none font-doto"
const queryClient = new QueryClient();

/**
 * Single Page Application Launch 
 * @returns 
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chats" element={<Home />} />
            <Route path="/chats/:chatId" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function NotFound() {
  return <h1 className={headerClassName}>404: Not Found</h1>;
}

function Home() {
  const { loggedIn, logout } = useContext(AuthContext);
  const { params } = useParams();
  const [showPopup, setShowPopup] = useState(false);

  const click = () => {
    console.log("show pop val ", showPopup);
    setShowPopup(!showPopup);
  }
  console.log("login val ", loggedIn);
  if (!loggedIn) {
    return <Login />;
  }
  else {
    return (
      <div className="h-screen flex flex-col">
        <h1 className={headerClassName}>Pony Express</h1>
        <div id="body" className="flex flex-1 overflow-hidden">
          <ChatNav onOpenCreateChat={click} />
          <MessagesContainer />
        </div>
        {showPopup && <CreateChatPopUp onClose={() => setShowPopup(false)} />}
      </div>
    );
  }
}
export default App;

