
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinChat, sendMessage, createChat } from "./api";



// const useLoggedIn = () => {
//     const { logout } = useAuth();
//     const query = useAccountQuery({ retry: false });
  
//     if (query.error?.code === "invalid_credentials") {
//       api.post("/auth/web/logout").then(logout);
//     }
//   };

const useJoinChatMutation = (headers, chatId, id, setMemberOfChat) => {
    return (
        useMutation({
            mutationFn: () =>
                joinChat(headers, chatId, id),
            onSuccess: () => {
                console.log("Joined Chat");
                setMemberOfChat(true);
            },
            onError: (error) => {
                console.log("errpr", error);
            },
        }));
};

const useSendMessageMutation = (headers, text, chatId, account_id, setMessage, inputRef) => {
    const queryClient = useQueryClient();

    return (
        useMutation({
            mutationFn: () =>
                sendMessage(headers, text, chatId, account_id),
            onSuccess: () => {
                setMessage("");
                queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
                if (inputRef.current) {
                    inputRef.current.value = "";
                }
            },
            onError: (error) => {
                if(error.status == 403) {console.log("error sending message 403");}
            },
        }));
}


const useCreateChatMutation = (headers, name, accountId)=> {
    const queryClient = useQueryClient();
    return (
        useMutation({
            mutationFn: () =>
                createChat(headers, name, accountId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chats" ] });
            },
            onError: (error) => 
            {
                console.log("Currently unable to create chat");
            },
        }));
}


export {
    useJoinChatMutation,
    useSendMessageMutation, 
    useCreateChatMutation
}