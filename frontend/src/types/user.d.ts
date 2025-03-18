export interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user" | "manager";
    avatar: string;
}

export type UserState = "loggedIn" | "loggedOut" | "loading";
