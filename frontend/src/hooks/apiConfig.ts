// Constants
const getApiBaseUrl = (): string => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
        return "http://localhost:8080"; // localhost
    } else {
        return import.meta.env.VITE_API_BASE_URL || 'https://default-api-url.com'; // production API from .env file
    }
};

const API_BASE_URL = getApiBaseUrl();
const JWT_STORAGE_KEY = 'jwtToken';

// Types
interface FetchOptions {
    method?: string;
    headers?: HeadersInit;
    body?: string;
}

enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}


const handleApiError = (error: any) => {
    console.error('API request failed:', error);
    throw error;
};

const getAuthHeaders = (): HeadersInit => {
    const jwtToken = localStorage.getItem(JWT_STORAGE_KEY);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
    }
    return headers;
};

export async function baseFetch<T>(endpoint: string, method: HttpMethod = HttpMethod.POST, data: any = null): Promise< T | undefined> {
    const options: FetchOptions = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) options.body = JSON.stringify(data);
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        
        if (!response.ok) {
            const errorResponse = await response.json(); 
            const errorMessage = errorResponse?.error || 'Request failed'; 
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}

export async function fetchWithJwt<T>(endpoint: string, method: HttpMethod = HttpMethod.POST, data: any = null):  Promise< T | undefined> {
    const headers = getAuthHeaders();
    const options: FetchOptions = { method, headers };
    if (data) options.body = JSON.stringify(data);
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`Request failed with status: ${response.status}`);
        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
}
