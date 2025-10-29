/**
 * Models
 * 
 * Esta pasta contém as definições de modelos de dados e interfaces TypeScript
 * que representam as entidades do banco de dados.
 * 
 * Exemplo de uso:
 * 
 * export interface User {
 *   id: string;
 *   email: string;
 *   full_name?: string;
 *   is_mentor: boolean;
 *   created_at: Date;
 * }
 * 
 * export interface MentorProfile {
 *   user_id: string;
 *   bio?: string;
 *   experience_years: number;
 *   subjects: string;
 *   location?: string;
 *   graduation_id?: string;
 * }
 */

// Tipos de usuário
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  is_mentor: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  user_id: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  graduation?: string;
  phone?: string;
  location?: string;
  created_at: Date;
}

export interface MentorProfile {
  user_id: string;
  bio?: string;
  experience_years: number;
  subjects: string;
  location?: string;
  graduation_id?: string;
  availability?: string;
  created_at: Date;
}

// Tipos de agendamento
export interface Booking {
  id: string;
  student_id: string;
  mentor_id: string;
  subject_id?: string;
  subject_name?: string;
  date: Date;
  time: string;
  duration: number;
  status: BookingStatus;
  objective?: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  cancel_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

// Tipos de mensagens e notificações
export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  booking_id?: string;
  read: boolean;
  created_at: Date;
}

// Tipos de avaliação
export interface Rating {
  id: string;
  booking_id: string;
  student_id: string;
  mentor_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
}

export default {};
