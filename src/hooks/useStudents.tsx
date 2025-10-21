import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';

export interface StudentProfile {
    id: string; // profiles.id
    user_id: string; // auth.users.id
    full_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    is_mentor?: boolean;
    created_at?: string;
    updated_at?: string;
}

export const useStudents = () => {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await apiClient.students.getAll();
            setStudents((data || []) as StudentProfile[]);
        } catch (err: any) {
            setError(err?.message || 'Erro ao buscar estudantes');
        } finally {
            setLoading(false);
        }
    };

    const getStudentByUserId = async (userId: string) => {
        const data = await apiClient.students.getByUserId(userId);
        return data as StudentProfile;
    };

    // Criar profile (user_id é obrigatório)
    const createStudent = async (payload: Partial<StudentProfile> & { user_id: string }) => {
        try {
            const data = await apiClient.students.create(payload);
            setStudents(prev => [...prev, data as StudentProfile]);
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao criar estudante');
        }
    };

    const updateStudentByUserId = async (userId: string, updates: Partial<StudentProfile>) => {
        try {
            const data = await apiClient.students.update(userId, updates);
            setStudents(prev => prev.map(s => (s.user_id === userId ? (data as StudentProfile) : s)));
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao atualizar estudante');
        }
    };

    const deleteStudentByUserId = async (userId: string) => {
        try {
            const data = await apiClient.students.delete(userId);
            setStudents(prev => prev.filter(s => s.user_id !== userId));
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao deletar estudante');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    return {
        students,
        loading,
        error,
        fetchStudents,
        getStudentByUserId,
        createStudent,
        updateStudentByUserId,
        deleteStudentByUserId,
    };
};

export default useStudents;
