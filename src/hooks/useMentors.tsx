import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MentorProfile {
    id: string; // mentor_profiles.id
    user_id: string;
    graduation_id?: string;
    price_per_hour?: number;
    rating?: number;
    total_sessions?: number;
    location?: string;
    availability?: string;
    experience_years?: number;
    created_at?: string;
    updated_at?: string;
}

export const useMentors = () => {
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            // Busca mentor_profiles juntando com profiles para nome/email
            const { data, error } = await supabase
                .from('mentor_profiles')
                .select('*, profiles:profiles(user_id, full_name, email)')
                .order('rating', { ascending: false });

            if (error) throw error;
            setMentors((data || []) as any);
        } catch (err: any) {
            setError(err?.message || 'Erro ao buscar mentores');
        } finally {
            setLoading(false);
        }
    };

    const getMentor = async (userId: string) => {
        const { data, error } = await supabase
            .from('mentor_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data as MentorProfile;
    };

    // user_id é obrigatório ao criar um mentor
    const createMentor = async (payload: Partial<MentorProfile> & { user_id: string }) => {
        try {
            const { data, error } = await supabase
                .from('mentor_profiles')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            setMentors(prev => [...prev, data as MentorProfile]);
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao criar mentor');
        }
    };

    const updateMentor = async (userId: string, updates: Partial<MentorProfile>) => {
        try {
            const { data, error } = await supabase
                .from('mentor_profiles')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            setMentors(prev => prev.map(m => (m.user_id === userId ? (data as MentorProfile) : m)));
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao atualizar mentor');
        }
    };

    const deleteMentor = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('mentor_profiles')
                .delete()
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            setMentors(prev => prev.filter(m => m.user_id !== userId));
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao deletar mentor');
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    return {
        mentors,
        loading,
        error,
        fetchMentors,
        getMentor,
        createMentor,
        updateMentor,
        deleteMentor,
    };
};

export default useMentors;
