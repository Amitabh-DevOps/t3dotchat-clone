

import { userType } from "@/types/user.type";
import { create } from "zustand";

type UserStoreType = {
    userData: userType | null;
    setUserData: (userData: userType | null) => void;
    currentModel: string;
    setCurrentModel: (model: string) => void;
}

const userStore = create<UserStoreType>((set) => ({
    userData:null,
    setUserData: (userData: userType | null) => set({ userData }),
    currentModel: "meta-llama/llama-3.1-405b-instruct",
    setCurrentModel: (model: string) => set({ currentModel: model }),
}))

export default userStore
