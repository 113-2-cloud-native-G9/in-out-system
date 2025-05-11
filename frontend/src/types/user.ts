export type UserState = "loggedIn" | "loggedOut" | "loading";

export interface User {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    is_manager: boolean;
    is_admin: boolean;
    job_title: string;
    organization_id: string;
    organization_name: string;
    hire_status: "active" | "inactive" | "onleave";
    hire_date: string;
}
