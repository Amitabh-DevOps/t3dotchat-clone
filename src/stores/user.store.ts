

import { userType } from "@/types/user.type";
import { create } from "zustand";

type UserStoreType = {
    userData: userType | null;
    setUserData: (userData: userType | null) => void;
}

const userStore = create<UserStoreType>((set) => ({
    userData:null,
    setUserData: (userData: userType | null) => set({ userData }),
}))

export default userStore
