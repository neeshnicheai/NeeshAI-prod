import { supabase } from '@/integrations/supabase/client';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

interface RequestConfig extends RequestInit {
    skipAuth?: boolean;
}

/**
 * API Client with automatic JWT token injection
 * Uses Supabase session tokens for authentication with Spring Boot backend
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        console.log('[API] Getting auth headers...');
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            console.log('[API] Token found, length:', session.access_token.length);
        } else {
            console.warn('[API] No session/token available');
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const timestamp = new Date().toISOString();

        if (response.status === 401) {
            console.error(`[API ${timestamp}] 401 Unauthorized - Session expired or invalid`);
            // Token expired or invalid - sign out and redirect
            await supabase.auth.signOut();
            window.location.href = '/login';
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            console.error(`[API ${timestamp}] Request failed with status ${response.status}`);
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API ${timestamp}] Error details:`, errorData);
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Handle empty responses (204 No Content)
        if (response.status === 204) {
            console.log(`[API ${timestamp}] 204 No Content - Empty response`);
            return {} as T;
        }

        const data = await response.json();
        console.log(`[API ${timestamp}] Response data received`, typeof data === 'object' ? `(${Object.keys(data).length} keys)` : '');
        return data;
    }

    async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        const headers = config?.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
        const fullUrl = `${this.baseUrl}${endpoint}`;
        const timestamp = new Date().toISOString();

        console.log(`[API ${timestamp}] 🔵 GET Request`);
        console.log(`  URL: ${fullUrl}`);
        console.log(`  Auth: ${config?.skipAuth ? 'No' : 'Yes'}`);

        const response = await fetch(fullUrl, {
            method: 'GET',
            headers,
            ...config,
        });

        console.log(`[API ${timestamp}] 🔵 GET Response - Status: ${response.status} ${response.statusText}`);
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
        const headers = config?.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
        const fullUrl = `${this.baseUrl}${endpoint}`;
        const timestamp = new Date().toISOString();

        console.log(`[API ${timestamp}] 🟢 POST Request`);
        console.log(`  URL: ${fullUrl}`);
        console.log(`  Body:`, data);

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
            ...config,
        });

        console.log(`[API ${timestamp}] 🟢 POST Response - Status: ${response.status} ${response.statusText}`);
        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
        const headers = config?.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
        const fullUrl = `${this.baseUrl}${endpoint}`;
        const timestamp = new Date().toISOString();

        console.log(`[API ${timestamp}] 🟡 PUT Request`);
        console.log(`  URL: ${fullUrl}`);
        console.log(`  Body:`, data);

        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
            ...config,
        });

        console.log(`[API ${timestamp}] 🟡 PUT Response - Status: ${response.status} ${response.statusText}`);
        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        const headers = config?.skipAuth ? { 'Content-Type': 'application/json' } : await this.getAuthHeaders();
        const fullUrl = `${this.baseUrl}${endpoint}`;
        const timestamp = new Date().toISOString();

        console.log(`[API ${timestamp}] 🔴 DELETE Request`);
        console.log(`  URL: ${fullUrl}`);

        const response = await fetch(fullUrl, {
            method: 'DELETE',
            headers,
            ...config,
        });

        console.log(`[API ${timestamp}] 🔴 DELETE Response - Status: ${response.status} ${response.statusText}`);
        return this.handleResponse<T>(response);
    }

    // Special method for file uploads (multipart/form-data)
    async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
        const { data: { session } } = await supabase.auth.getSession();

        const formData = new FormData();
        formData.append(fieldName, file);

        const headers: HeadersInit = {};
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        // Don't set Content-Type - browser will set it with boundary for multipart

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        return this.handleResponse<T>(response);
    }
}

// Export singleton instance
const apiClient = new ApiClient(BASE_URL);

export default apiClient;
export { ApiClient };
