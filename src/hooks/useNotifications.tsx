import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from './useAuth';

export const useNotifications = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPendingBookings = async () => {
            if (!user?.is_mentor || !user?.id) {
                setPendingCount(0);
                return;
            }

            try {
                const bookings = await apiClient.bookings.getByMentorId(user.id);
                const pending = bookings.filter((b: any) => b.status === 'pending');
                setPendingCount(pending.length);
            } catch (err) {
                console.error('Erro ao buscar notificações', err);
                setPendingCount(0);
            }
        };

        fetchPendingBookings();

        // Atualizar a cada 60 segundos
        const interval = setInterval(fetchPendingBookings, 60000);
        return () => clearInterval(interval);
    }, [user?.id, user?.is_mentor]);

    return { pendingCount };
};
