import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';

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
            const data = await apiClient.mentors.getAll();
            setMentors((data || []) as any);
        } catch (err: any) {
            setError(err?.message || 'Erro ao buscar mentores');
        } finally {
            setLoading(false);
        }
    };

    const getMentor = async (userId: string) => {
        const data = await apiClient.mentors.getByUserId(userId);
        return data as MentorProfile;
    };

    // user_id é obrigatório ao criar um mentor
    const createMentor = async (payload: Partial<MentorProfile> & { user_id: string }) => {
        try {
            const data = await apiClient.mentors.create(payload);
            setMentors(prev => [...prev, data as MentorProfile]);
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao criar mentor');
        }
    };

    const updateMentor = async (userId: string, updates: Partial<MentorProfile>) => {
        try {
            const data = await apiClient.mentors.update(userId, updates);
            setMentors(prev => prev.map(m => (m.user_id === userId ? (data as MentorProfile) : m)));
            return data;
        } catch (err: any) {
            throw new Error(err?.message || 'Erro ao atualizar mentor');
        }
    };

    const deleteMentor = async (userId: string) => {
        try {
            const data = await apiClient.mentors.delete(userId);
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
