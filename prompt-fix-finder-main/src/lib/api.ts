// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint: string, method: string, body?: object, token?: string) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Auth APIs
export const authAPI = {
    register: (userData: { name: string; email: string; password: string; role: string }) =>
        apiRequest('/auth/register', 'POST', userData),

    login: (credentials: { email: string; password: string }) =>
        apiRequest('/auth/login', 'POST', credentials),
};

// Shop APIs
export const shopAPI = {
    getAll: (token: string) => apiRequest('/shops', 'GET', undefined, token),
    getById: (id: string, token: string) => apiRequest(`/shops/${id}`, 'GET', undefined, token),
};

// Helper: Save & Get token from localStorage
export const saveToken = (token: string) => localStorage.setItem('enlance_token', token);
export const getToken = () => localStorage.getItem('enlance_token');
export const removeToken = () => localStorage.removeItem('enlance_token');
