import { CreateChatPopUp } from "./CreateChat";
import { AuthContext } from "../auth";
import { QueryClient, QueryClientProvider  } from "@tanstack/react-query";
import "../index.css"
const queryClient = new QueryClient(); 
export default {
  title: "Components/CreateChatPopup",
  component: CreateChatPopUp,
};

const mockAuth = {
  username: "storybook_user",
  id: 123,
  headers: { Authorization: "Bearer fake_token" },
};

export const Default = () => (
  
    <QueryClientProvider client={queryClient}>
  <AuthContext.Provider value={mockAuth}>

  <CreateChatPopUp onClose={() => setShowPopup(false)} /> 
  </AuthContext.Provider>
  </QueryClientProvider>
);
