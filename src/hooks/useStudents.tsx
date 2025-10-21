import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
            // profiles.is_mentor = false (or null)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .is('is_mentor', false)
                .order('full_name', { ascending: true });

            if (error) throw error;
            setStudents((data || []) as StudentProfile[]);
        } catch (err: any) {
            setError(err?.message || 'Erro ao buscar estudantes');
        } finally {
            setLoading(false);
        }
    };

    const getStudentByUserId = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data as StudentProfile;
    };

    // Criar profile (user_id é obrigatório)
    const createStudent = async (payload: Partial<StudentProfile> & { user_id: string }) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            setStudents(prev => [...prev, data as StudentProfile]);
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao criar estudante');
        }
    };

    const updateStudentByUserId = async (userId: string, updates: Partial<StudentProfile>) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            setStudents(prev => prev.map(s => (s.user_id === userId ? (data as StudentProfile) : s)));
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao atualizar estudante');
        }
    };

    const deleteStudentByUserId = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .delete()
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
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
