// 基於後端 EmployeeModel
export interface Employee {
    employee_id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    organization_id: string;
    job_title: string;
    hire_date: string;
    hire_status: string;
    is_admin: boolean;
    updated_at: string;
    updated_by: string;
}

// 用於顯示的員工資訊（可能包含額外的計算欄位）
export interface EmployeeDisplay extends Employee {
    full_name: string;
    organization_name?: string;
    attendance_status?: string;
}

// 用於創建員工的資料結構
export interface EmployeeCreateData {
    employee_id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    organization_id: string;
    job_title: string;
    hire_date: string;
    hire_status: string;
    is_admin: boolean;
    hashed_password: string;
}

// 用於更新員工的資料結構
export interface EmployeeUpdateData extends Partial<Omit<EmployeeCreateData, 'hashed_password'>> {
    employee_id: string;
}
