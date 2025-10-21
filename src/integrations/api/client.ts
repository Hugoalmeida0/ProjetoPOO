// API client com suporte a Auth (JWT)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Armazenamento simples do token no localStorage
const TOKEN_KEY = 'auth_token';
function getToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch { }
}

class APIError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Remove /api do endpoint se API_BASE_URL já for /api (para evitar /api/api)
    const cleanEndpoint = API_BASE_URL === '/api' && endpoint.startsWith('/api')
        ? endpoint.replace('/api', '')
        : endpoint;
    const url = `${API_BASE_URL}${cleanEndpoint}`;

    const token = getToken();
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new APIError(response.status, error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

export const apiClient = {
    // Auth
    auth: {
        register: (payload: { email: string; password: string; full_name?: string }) =>
            fetchAPI<{ token: string; user: any }>(`/api/auth/register`, { method: 'POST', body: JSON.stringify(payload) }),
        login: (payload: { email: string; password: string }) =>
            fetchAPI<{ token: string; user: any }>(`/api/auth/login`, { method: 'POST', body: JSON.stringify(payload) }),
        me: () => fetchAPI<{ user: any }>(`/api/auth/me`),
    },
    // Users (self)
    users: {
        getMe: () => fetchAPI<any>(`/api/users/me`),
        updateMe: (data: { email?: string; full_name?: string }) => fetchAPI<any>(`/api/users/me`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteMe: () => fetchAPI<any>(`/api/users/me`, {
            method: 'DELETE',
        }),
    },
    // Subjects
    subjects: {
        getAll: (graduationId?: string) => {
            const params = graduationId ? `?graduation_id=${graduationId}` : '';
            return fetchAPI<any[]>(`/api/subjects${params}`);
        },
        getById: (id: string) => fetchAPI<any>(`/api/subjects/${id}`),
    },

    // Graduations
    graduations: {
        getAll: () => fetchAPI<any[]>('/api/graduations'),
    },

    // Profiles
    profiles: {
        getAll: () => fetchAPI<any[]>('/api/profiles'),
        getByUserId: (userId: string) => fetchAPI<any>(`/api/profiles/${userId}`),
        create: (data: any) => fetchAPI<any>('/api/profiles', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (userId: string, data: any) => fetchAPI<any>(`/api/profiles/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (userId: string) => fetchAPI<any>(`/api/profiles/${userId}`, {
            method: 'DELETE',
        }),
    },

    // Students
    students: {
        getAll: () => fetchAPI<any[]>('/api/students'),
        getByUserId: (userId: string) => fetchAPI<any>(`/api/students/${userId}`),
        create: (data: any) => fetchAPI<any>('/api/students', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (userId: string, data: any) => fetchAPI<any>(`/api/students/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (userId: string) => fetchAPI<any>(`/api/students/${userId}`, {
            method: 'DELETE',
        }),
    },

    // Mentors
    mentors: {
        getAll: () => fetchAPI<any[]>('/api/mentors'),
        getByUserId: (userId: string) => fetchAPI<any>(`/api/mentors/${userId}`),
        create: (data: any) => fetchAPI<any>('/api/mentors', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (userId: string, data: any) => fetchAPI<any>(`/api/mentors/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (userId: string) => fetchAPI<any>(`/api/mentors/${userId}`, {
            method: 'DELETE',
        }),
    },

    // Mentor Subjects (many-to-many relation)
    mentorSubjects: {
        getByMentorId: (mentorId: string) => fetchAPI<any[]>(`/api/mentor-subjects/${mentorId}`),
        setSubjects: (mentorId: string, subjectIds: string[]) => fetchAPI<any[]>(`/api/mentor-subjects/${mentorId}`, {
            method: 'POST',
            body: JSON.stringify({ subject_ids: subjectIds }),
        }),
        addSubject: (mentorId: string, subjectId: string) => fetchAPI<any>(`/api/mentor-subjects/${mentorId}/add`, {
            method: 'POST',
            body: JSON.stringify({ subject_id: subjectId }),
        }),
        removeSubject: (mentorId: string, subjectId: string) => fetchAPI<any>(`/api/mentor-subjects/${mentorId}/${subjectId}`, {
            method: 'DELETE',
        }),
    },

    // Bookings
    bookings: {
        getByUserId: (userId: string) => fetchAPI<any[]>(`/api/bookings/user/${userId}`),
        getByMentorId: (mentorId: string) => fetchAPI<any[]>(`/api/bookings/mentor/${mentorId}`),
        create: (data: any) => fetchAPI<any>('/api/bookings', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateStatus: (bookingId: string, status: string, cancel_message?: string, user_id?: string) => fetchAPI<any>(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            body: JSON.stringify({ status, cancel_message, user_id }),
        }),
    },

    // Messages
    messages: {
        getByBookingId: (bookingId: string) => fetchAPI<any[]>(`/api/messages/${bookingId}`),
        create: (data: { booking_id: string; content: string }) => fetchAPI<any>('/api/messages', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },

    // Notifications
    notifications: {
        getAll: () => fetchAPI<any[]>('/api/notifications'),
        getUnreadCount: () => fetchAPI<{ count: number }>('/api/notifications/unread-count'),
        markAsRead: (notificationId: string) => fetchAPI<any>(`/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
        }),
        markAllAsRead: () => fetchAPI<any>('/api/notifications/mark-all-read', {
            method: 'PATCH',
        }),
    },
};
