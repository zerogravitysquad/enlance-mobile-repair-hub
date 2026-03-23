// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint: string, method: string, body?: any, token?: string) => {
    const headers: Record<string, string> = {};

    // Only set Content-Type to application/json if we are NOT sending FormData
    const isFormData = body instanceof FormData;
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        data = { message: text || `Server Error (${response.status})` };
    }

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Auth APIs
export const authAPI = {
    register: (userData: { name: string; email: string; password: string; role: string; mobile: string; city: string; address?: string }) =>
        apiRequest('/auth/register', 'POST', userData),

    login: (credentials: { email: string; password: string }) =>
        apiRequest('/auth/login', 'POST', credentials),
};

// Shop APIs
export const shopAPI = {
    getAll: (token: string) => apiRequest('/shops', 'GET', undefined, token),
    getById: (id: string, token: string) => apiRequest(`/shops/${id}`, 'GET', undefined, token),
    getRequests: (city: string, token: string) => apiRequest(`/request/city/${city}`, 'GET', undefined, token),
    sendQuotation: (quotationData: any, token: string) =>
        apiRequest('/quotation', 'POST', quotationData, token),
};

// Request APIs
export const requestAPI = {
    create: (requestData: any, token: string) => {
        // Handle multipart/form-data for images if needed, 
        // but for now we'll assume JSON or base64 if that's what the frontend sends
        return apiRequest('/request', 'POST', requestData, token);
    },
    getUserRequests: (userId: string, token: string) =>
        apiRequest(`/request/user/${userId}`, 'GET', undefined, token),
    markCompleted: (requestId: string, token: string) =>
        apiRequest(`/request/complete/${requestId}`, 'PUT', undefined, token),
};

// Chat APIs
export const chatAPI = {
    getRooms: (token: string) => apiRequest('/chat/rooms', 'GET', undefined, token),
    getMessages: (requestId: string, token: string) =>
        apiRequest(`/chat/messages/${requestId}`, 'GET', undefined, token),
    sendMessage: (chatData: { requestId: string; receiverId: string; message: string }, token: string) =>
        apiRequest('/chat', 'POST', chatData, token),
};

// Helper: Save & Get token from localStorage
export const saveToken = (token: string) => localStorage.setItem('enlance_token', token);
export const getToken = () => localStorage.getItem('enlance_token');
export const removeToken = () => localStorage.removeItem('enlance_token');
