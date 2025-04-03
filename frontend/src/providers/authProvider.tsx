import React, { createContext, useContext, useState, ReactNode } from "react";
import { jwtDecode } from 'jwt-decode';  // Correct the import if needed (use named or default import)
import { api } from "@/hooks/apiEndpoints"; // Assuming you have API calls like login in this file
import { User } from "@/types"; // Assuming you have a User type for user information

interface LoginResponse {
    jwt_token: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    job_title: string;
    organization_id: string;
    organization_name: string;
}

// UserState interface for managing the authentication state
interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: { employee_id: string, hashed_password: string }) => void;
    logout: () => void;
    authState: "loggedIn" | "loggedOut" | "loading";
}

// Initial state for the user
const initialUserState: UserState = {
    user: null,
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
    authState: "loading"
};

// Create Context
const UserContext = createContext<UserState>(initialUserState);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [userState, setUserState] = useState<UserState>(initialUserState);

    const login = async (credentials: { employee_id: string, hashed_password: string }) => {
        try {
            setUserState((prevState) => ({ ...prevState, authState: "loading" }));  // Set loading state before API call

            // Call the login API and assert the response type
            const response = await api.login(credentials) as LoginResponse;

            if (response && response.jwt_token) {
                // Decode the JWT token
                const decoded = jwtDecode<any>(response.jwt_token);

                const currentUser = {
                    employee_id: String(decoded.sub.employee_id),  
                    first_name: response.first_name,
                    last_name: response.last_name,
                    email: response.email,
                    phone_number: response.phone_number,
                    job_title: response.job_title,
                    organization_id: response.organization_id,
                    organization_name: response.organization_name,
                    is_manager: Boolean(decoded.sub.is_manager),
                    is_admin: Boolean(decoded.sub.is_admin),
                    hire_status: decoded.sub.hire_status as "active" | "inactive" | "onleave",
                    hire_date: decoded.sub.hire_date
                };

                // Update the userState
                setUserState({
                    user: currentUser,
                    isAuthenticated: true,
                    login,
                    logout,
                    authState: "loggedIn"
                });

                // Store data in localStorage
                localStorage.setItem("jwtToken", response.jwt_token);
                localStorage.setItem("currentUser", JSON.stringify(currentUser));

            } else {
                setUserState((prevState) => ({ ...prevState, authState: "loggedOut" }));
                throw new Error("No JWT token in response.");
            }
        } catch (error) {
            setUserState((prevState) => ({ ...prevState, authState: "loggedOut" }));
            throw new Error(error instanceof Error ? error.message : 'Login failed. Please try again.');
        }
    };

    const logout = () => {
        localStorage.clear();

        // Reset userState
        setUserState({
            user: null,
            isAuthenticated: false,
            login,
            logout,
            authState: "loggedOut"
        });
    };

    return (
        <UserContext.Provider value={{ ...userState, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};