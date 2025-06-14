
import { create } from "zustand";

type ChatStoreType = {
   query: string;
   setQuery: (query: string) => void;
   response: string;
   setResponse: (response: string) => void;
   messages: any;
   setMessages: (messages: any) => void;
   isLoading: boolean;
   setIsLoading: (isLoading: boolean) => void;
}

const chatStore = create<ChatStoreType>((set) => ({
    query: "",
    setQuery: (query: string) => set({ query }),
    response: "",
    setResponse: (response: string) => set({ response }),
    messages: [],
    setMessages: (messages: any) => set({ messages }),
    isLoading: false,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
}))

export default chatStore
