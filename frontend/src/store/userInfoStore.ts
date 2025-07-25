import { create } from "zustand";

export interface UserInfo {
  firstName: string;
  email: string;
  phone: string;
}

interface UserInfoStore {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
  clearUserInfo: () => void;
}

export const useUserInfoStore = create<UserInfoStore>((set) => ({
  userInfo: null,
  setUserInfo: (info) => set({ userInfo: info }),
  clearUserInfo: () => set({ userInfo: null }),
}));
