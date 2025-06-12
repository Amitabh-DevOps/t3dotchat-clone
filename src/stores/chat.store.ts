
import { create } from "zustand";

type ChatStoreType = {
   query: string;
   setQuery: (query: string) => void;
   response: string;
   setResponse: (response: string) => void;
}

const chatStore = create<ChatStoreType>((set) => ({
    query: "",
    setQuery: (query: string) => set({ query }),
    response: "",
    setResponse: (response: string) => set({ response }),
}))

export default chatStore
