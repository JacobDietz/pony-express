//import api from "./api";
import { useQuery,  QueryClient } from "@tanstack/react-query";
import  api from "../../api/api";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

/**
 * Retrieves and sorts all JSON chat objects using React Query from API
 * Essentially retrieving from database
 * @returns {Array} of JSON chat objects
 */
export const useAllChats = () => {
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
export const useChatMessages = (chatId) => {
    const { data, refetch } = useQuery({
        queryKey: ["messages", chatId],
        queryFn: () => api.get("/chats/" + chatId + "/messages"),
        enabled: !!chatId, 
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

/**
 * Gathers all the accounts that are in a given chat
 * 
 * @param {*} chatId identifies 
 * @returns 
 */
export const useAccountsInChat = (chatId) => {
    const { data : accounts} = useQuery({
        queryKey: ["chat", chatId, "messages"],
        queryFn: () => api.get("/chats/" + chatId + "/accounts"), 
        enabled: !!chatId, 
    });

    const usernames = accounts?.accounts?.map(acc => acc.username) ?? [];

    return {usernames}
}

