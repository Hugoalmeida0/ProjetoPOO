/**
 * Types
 * 
 * Esta pasta contém definições de tipos TypeScript compartilhados
 * pela aplicação frontend.
 */

// Tipos de usuário
export interface User {
    id: string;
    email: string;
    full_name?: string;
    is_mentor: boolean;
}

export interface Profile {
    user_id: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    graduation?: string;
    phone?: string;
    location?: string;
}

export interface MentorProfile {
    user_id: string;
    bio?: string;
    experience_years: number;
    subjects: string;
    location?: string;
    graduation_id?: string;
    avg_rating?: number;
    total_ratings?: number;
}

// Tipos de graduação e disciplinas
export interface Graduation {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export interface Subject {
    id: string;
    name: string;
    graduation_id?: string;
    description?: string;
}

// Tipos de agendamento
export interface Booking {
    id: string;
    student_id: string;
    mentor_id: string;
    subject_id?: string;
    subject_name?: string;
    date: string;
    time: string;
    duration: number;
    status: BookingStatus;
    objective?: string;
    student_name: string;
    student_email: string;
    student_phone?: string;
    cancel_reason?: string;
    created_at: string;
    updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

// Tipos de mensagens
export interface Message {
    id: string;
    booking_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

// Tipos de notificações
export interface Notification {
    id: string;
    user_id: string;
    message: string;
    booking_id?: string;
    read: boolean;
    created_at: string;
}

// Tipos de avaliação
export interface Rating {
    id: string;
    booking_id: string;
    student_id: string;
    mentor_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface RatingStats {
    avg_rating: number;
    total_ratings: number;
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

// Tipos de autenticação
export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name?: string;
}
