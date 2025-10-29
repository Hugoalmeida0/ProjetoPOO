import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { useAuth } from './useAutenticacao';

export interface Message {
    id: string;
    booking_id: string;
    sender_id: string;
    sender_name: string;
    sender_email: string;
    content: string;
    created_at: string;
}

export const useMessages = (bookingId: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchMessages = useCallback(async () => {
        if (!bookingId) return;

        try {
            setLoading(true);
            const data = await apiClient.messages.getByBookingId(bookingId);
            setMessages(data as Message[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens');
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    const sendMessage = async (content: string) => {
        if (!bookingId || !content.trim()) return;

        try {
            const data = await apiClient.messages.create({
                booking_id: bookingId,
                content: content.trim(),
            });
            setMessages(prev => [...prev, data as Message]);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
            throw err;
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return {
        messages,
        loading,
        error,
        sendMessage,
        refreshMessages: fetchMessages,
    };
};
