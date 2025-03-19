// src/providers/UserProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types";
import { mockUser } from "@/mocks/user";

// 用戶狀態接口
interface UserState {
    user: User | null;
    isAuthenticated: boolean;
}

// 初始化狀態
// const initialUserState: UserState = {
//     user: null,
//     isAuthenticated: false,
// };


const mockUserState: UserState = {
    user: mockUser,
    isAuthenticated: true,
};

// 建立 Context
const UserContext = createContext<UserState | undefined>(undefined);

// Provider 組件
interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [userState, setUserState] = useState<UserState>(mockUserState);

    // 設置使用者登錄狀態
    const login = (user: User) => {
        setUserState({
            user,
            isAuthenticated: true,
        });
    };

    // 設置登出狀態
    const logout = () => {
        setUserState({
            user: null,
            isAuthenticated: false,
        });
    };

    return (
        <UserContext.Provider
            value={{ ...userState, login, logout } as UserState}
        >
            {children}
        </UserContext.Provider>
    );
};

// 使用 Context 的自定義 hook
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
