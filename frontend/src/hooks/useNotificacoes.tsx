import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { useAuth } from './useAutenticacao';

export interface Notification {
    id: string;
    user_id: string;
    message: string;
    booking_id: string | null;
    booking_date?: string;
    booking_time?: string;
    read: boolean;
    created_at: string;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await apiClient.notifications.getAll();
            setNotifications(data as Notification[]);

            // Atualizar contador de não lidas
            const count = (data as Notification[]).filter(n => !n.read).length;
            setUnreadCount(count);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;

        try {
            const data = await apiClient.notifications.getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error('Erro ao buscar contador de notificações:', err);
        }
    }, [user]);

    const markAsRead = async (notificationId: string) => {
        try {
            await apiClient.notifications.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao marcar notificação como lida');
            throw err;
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.notifications.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao marcar todas como lidas');
            throw err;
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Polling a cada 30 segundos para atualizar notificações
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
    };
};
