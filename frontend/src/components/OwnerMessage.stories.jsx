import MessageInput from "./MessageInput";
import { AuthContext } from "../auth";
import { QueryClient, QueryClientProvider  } from "@tanstack/react-query";
import "../index.css"

const queryClient = new QueryClient(); 
export default {
  title: "Components/MessageInput",
  component: MessageInput,
};

const mockAuth = {
  username: "storybook_user",
  id: 123,
  headers: { Authorization: "Bearer fake_token" },
};

export const Default = () => (
  
    <QueryClientProvider client={queryClient}>
  <AuthContext.Provider value={mockAuth}>
    <MessageInput chatId={1} accountsInChat={[]} refetch={() => {}} />
  </AuthContext.Provider>
  </QueryClientProvider>
);
