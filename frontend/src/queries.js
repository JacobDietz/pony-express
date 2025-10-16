import api from "./api";
import { useQuery,  QueryClient } from "@tanstack/react-query";
import { sendMessage } from "./api";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

/**
 * Retrieves and sorts all JSON chat objects using React Query from API
 * Essentially retrieving from database
 * @returns {Array} of JSON chat objects
 */
export const useAllChats = () => {
    console.log("GETTING CHATS FOR NAV BAR");
    const { data } = useQuery({
        queryKey: ["chats"],
        queryFn: () => api.get("/chats")
    });

    const { chats } = data || { metadata: null, chats: [] }
    chats.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    return chats
}

/**
 * Retrieves and sorts by created_at date of all JSON message objects associated with their chat
 * @param {*} id of chat
 * @returns array of JSON message objects or empty array if data not defined
 */
export const useChatMessages = (id) => {
    const { data, refetch } = useQuery({
        queryKey: ["messages", id],
        queryFn: () => api.get("/chats/" + id + "/messages")
    });

    // const { messages } = data || []
    const messages = data?.messages ?? [];
    return { messages, refetch }
}

/**
 * 
 * @param {*} id of account
 * @returns 
 */
export const useAccountName = (id) => {
    const { data : account} = useQuery({
        queryKey: ["account", id],
        queryFn: () => api.get("/accounts/" + id)
    });
    return {account}
}

export const useAccountsInChat = (chatId) => {
    const { data : accounts} = useQuery({
        queryKey: ["chat", chatId, "messages"],
        queryFn: () => api.get("/chats/" + chatId + "/accounts")
    });

    const usernames = accounts?.accounts?.map(acc => acc.username) ?? [];

    //return accounts
    return {usernames}
}

