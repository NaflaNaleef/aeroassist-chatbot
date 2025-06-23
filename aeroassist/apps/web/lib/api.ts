// API configuration for frontend to communicate with backend

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_TIMEOUT = 10000; // 10 seconds

// API Error class for better error handling
export class APIError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        message?: string
    ) {
        super(message || `${status} ${statusText}`);
        this.name = 'APIError';
    }
}

// Generic response type for API calls
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const apiClient = {
    get: async <T = any>(endpoint: string): Promise<T> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new APIError(
                    response.status,
                    response.statusText,
                    await response.text()
                );
            }

            return response.json();
        } catch (error: unknown) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new APIError(408, 'Request Timeout', 'Request took too long to complete');
            }
            if (error instanceof Error) {
                throw new APIError(500, 'Internal Error', error.message);
            }
            throw new APIError(500, 'Internal Error', 'Unknown error occurred');
        } finally {
            clearTimeout(timeoutId);
        }
    },

    post: async <T = any, D = any>(endpoint: string, data: D): Promise<T> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new APIError(
                    response.status,
                    response.statusText,
                    await response.text()
                );
            }

            return response.json();
        } catch (error: unknown) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new APIError(408, 'Request Timeout', 'Request took too long to complete');
            }
            if (error instanceof Error) {
                throw new APIError(500, 'Internal Error', error.message);
            }
            throw new APIError(500, 'Internal Error', 'Unknown error occurred');
        } finally {
            clearTimeout(timeoutId);
        }
    }
};

// Health check response type
interface HealthCheckResponse {
    status: string;
    service: string;
}

// Test function to verify backend connection
export const testBackendConnection = async (): Promise<APIResponse<HealthCheckResponse>> => {
    try {
        const data = await apiClient.get<HealthCheckResponse>('/health');
        return { success: true, data };
    } catch (error: unknown) {
        if (error instanceof APIError) {
            return {
                success: false,
                error: `${error.status} ${error.statusText}: ${error.message}`
            };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Unknown error occurred' };
    }
}; 