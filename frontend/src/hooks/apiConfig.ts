// Constants
const getApiBaseUrl = (): string => {
    // 偵測當前環境是否為開發（localhost），並返回相應的 URL
    // const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isLocalhost = false;

    if (isLocalhost) {
        return "http://localhost:8080"; // localhost (開發環境)
        // return 'http://127.0.0.1:8080';
    } else {
        // 這裡使用 VITE_API_BASE_URL 環境變數，並且在 production 中配置後端服務的 URL
        return (
            import.meta.env.VITE_API_BASE_URL ||
            "https://in-out-system-996829019525.asia-east1.run.app"
        ); // production API from .env file
    }
};

const API_BASE_URL = getApiBaseUrl(); // 動態獲取 API 基本 URL
const JWT_STORAGE_KEY = "jwtToken";

// Types
interface FetchOptions {
    method?: string;
    headers?: HeadersInit;
    body?: string;
}

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
}

// 處理 API 錯誤
const handleApiError = (error: any) => {
    console.error("API request failed:", error);
    throw error;
};

// 獲取認證標頭 (Authorization Header)
const getAuthHeaders = (): HeadersInit => {
    const jwtToken = localStorage.getItem(JWT_STORAGE_KEY);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (jwtToken) {
        headers["Authorization"] = `Bearer ${jwtToken}`;
    }
    return headers;
};

// 基本的 fetch 函數，供其他 API 調用使用
export async function baseFetch<T>(
    endpoint: string,
    method: HttpMethod = HttpMethod.POST,
    data: any = null
): Promise<T> {
    const options: FetchOptions = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorResponse = await response.json();
            const errorMessage = errorResponse?.error || "Request failed";
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}

// 使用 JWT Token 認證的 fetch 函數
export async function fetchWithJwt<T>(
    endpoint: string,
    method: HttpMethod = HttpMethod.POST,
    data: any = null
): Promise<T> {
    const headers = getAuthHeaders();
    const options: FetchOptions = { method, headers };
    if (data && method !== HttpMethod.GET) options.body = JSON.stringify(data);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorResponse = await response.json();
            const errorMessage = errorResponse?.error || "Request failed";
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}
