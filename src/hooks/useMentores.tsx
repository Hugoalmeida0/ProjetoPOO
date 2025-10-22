import { useState, useEffect } from 'react';
import { apiClient } from '@/integracoes/api/client';

export interface MentorProfile {
    id: string; // mentor_profiles.id
    user_id: string;
    graduation_id?: string;
    price_per_hour?: number;
    // Avaliações agregadas vindas da API
    avg_rating?: number;
    total_ratings?: number;
    // Compatibilidade legado
    rating?: number;
    total_sessions?: number;
    location?: string;
    availability?: string;
    experience_years?: number;
    created_at?: string;
    updated_at?: string;
    profiles?: any;
}

export const useMentors = () => {
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const data = await apiClient.mentors.getAll();
            // Normalizar avaliações para números
            const normalized = (data || []).map((m: any) => ({
                ...m,
                avg_rating: Number(m?.avg_rating) || 0,
                total_ratings: Number(m?.total_ratings) || 0,
            }));
            setMentors(normalized as any);
        } catch (err: any) {
            console.error('Erro ao buscar mentores:', err);
            setError(err?.message || 'Erro ao buscar mentores');
        } finally {
            setLoading(false);
        }
    };

    const getMentor = async (userId: string) => {
        const data = await apiClient.mentors.getByUserId(userId);
        const normalized = {
            ...data,
            avg_rating: Number((data as any)?.avg_rating) || 0,
            total_ratings: Number((data as any)?.total_ratings) || 0,
        } as MentorProfile;
        return normalized;
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
