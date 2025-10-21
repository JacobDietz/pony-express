import { BrowserRouter, Routes, Route, useParams } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthProvider from "./auth";
import Login from "./pages/login"
import Settings from "./pages/settings";
import Registration from "./pages/registration";
import Home from "./pages/Home.jsx"

const headerClassName = "text-5xl md:text-9xl text-center font-extrabold text-white text-outline my-none mb-none font-doto"
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
            <Route path="/" element={<Home/>} />
            <Route path="/chats" element={<Home/>} />
            <Route path="/chats/:chatId" element={<Home/>} />
        

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

export default App;

