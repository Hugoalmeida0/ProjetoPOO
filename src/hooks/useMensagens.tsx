import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/integracoes/api/client';
import { useAuth } from './useAutenticacao';
import { onEvent, ensureRealtime } from '@/integracoes/realtime';

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
        let off: (() => void) | null = null;
        // Inscrever em mensagens realtime (se disponível) e fazer join em rooms
        (async () => {
            try {
                const s = await ensureRealtime();
                if (s) {
                    // juntar-se a sala do booking e do usuário para receber apenas mensagens relevantes
                    if (bookingId) s.emit('join:booking', bookingId);
                    if (user?.id) s.emit('join:user', user.id);

                    off = await onEvent('message:new', (msg: any) => {
                        if (!bookingId) return;
                        if (msg.booking_id === bookingId) {
                            setMessages(prev => [...prev, msg]);
                        }
                    });
                }
            } catch (e) {
                console.warn('Realtime not available for messages:', String(e));
            }
        })();

        return () => {
            try {
                if (off) off();
                // deixar salas
                (async () => {
                    const s = await ensureRealtime();
                    if (s) {
                        if (bookingId) s.emit('leave:booking', bookingId);
                        // not leaving user room to allow other flows (optional)
                    }
                })();
            } catch { /* ignore */ }
        };
    }, [fetchMessages]);

    return {
        messages,
        loading,
        error,
        sendMessage,
        refreshMessages: fetchMessages,
    };
};
