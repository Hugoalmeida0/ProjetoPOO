import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Booking {
    id: string;
    student_id: string;
    mentor_id: string;
    subject_id: string;
    date: string;
    time: string;
    duration: number;
    objective: string;
    student_name: string;
    student_email: string;
    student_phone: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
    updated_at: string;
}

export const useBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Buscar agendamentos do usuário
    const fetchUserBookings = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`)
                .order('date', { ascending: true })
                .order('time', { ascending: true });

            if (error) throw error;
            setBookings((data || []) as Booking[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos');
        } finally {
            setLoading(false);
        }
    };

    // Buscar agendamentos de um mentor específico
    const fetchMentorBookings = async (mentorId: string) => {
        try {
            console.log('Buscando agendamentos para mentorId:', mentorId);

            // Verificar se o mentorId é um UUID válido
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(mentorId)) {
                console.warn('mentorId não é um UUID válido:', mentorId);
                return [];
            }

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('mentor_id', mentorId)
                .in('status', ['pending', 'confirmed'])
                .order('date', { ascending: true })
                .order('time', { ascending: true });

            if (error) {
                console.error('Erro do Supabase:', error);
                throw error;
            }

            console.log('Agendamentos encontrados:', data);
            return data || [];
        } catch (err) {
            console.error('Erro ao carregar agendamentos do mentor:', err);
            return [];
        }
    };

    // Verificar se um horário está ocupado
    const isTimeSlotOccupied = (mentorId: string, date: string, time: string) => {
        return bookings.some(booking =>
            booking.mentor_id === mentorId &&
            booking.date === date &&
            booking.time === time &&
            ['pending', 'confirmed'].includes(booking.status)
        );
    };

    // Criar novo agendamento
    const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            console.log("Tentando criar agendamento:", bookingData);

            // Verificar se todos os campos obrigatórios estão presentes
            const requiredFields = ['student_id', 'mentor_id', 'subject_id', 'date', 'time', 'duration', 'student_name', 'student_email', 'status'];
            const missingFields = requiredFields.filter(field => !bookingData[field as keyof typeof bookingData]);

            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
            }

            // Verificar se os UUIDs são válidos
            const uuidFields = ['student_id', 'mentor_id', 'subject_id'];
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            for (const field of uuidFields) {
                const value = bookingData[field as keyof typeof bookingData] as string;
                if (!uuidRegex.test(value)) {
                    throw new Error(`Campo ${field} não é um UUID válido: ${value}`);
                }
            }

            const { data, error } = await supabase
                .from('bookings')
                .insert([bookingData])
                .select()
                .single();

            console.log("Resposta do Supabase:", { data, error });

            if (error) {
                console.error("Erro do Supabase:", error);
                console.error("Detalhes do erro:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            setBookings(prev => [...prev, data as Booking]);
            return data;
        } catch (err) {
            console.error("Erro ao criar agendamento:", err);
            setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
            throw err;
        }
    };

    // Atualizar status do agendamento
    const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw error;

            setBookings(prev =>
                prev.map(booking =>
                    booking.id === bookingId ? (data as Booking) : booking
                )
            );
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar agendamento');
            throw err;
        }
    };

    // Cancelar agendamento
    const cancelBooking = async (bookingId: string) => {
        return updateBookingStatus(bookingId, 'cancelled');
    };

    // Finalizar agendamento
    const completeBooking = async (bookingId: string) => {
        return updateBookingStatus(bookingId, 'completed');
    };

    // Confirmar agendamento (para mentores)
    const confirmBooking = async (bookingId: string) => {
        return updateBookingStatus(bookingId, 'confirmed');
    };

    useEffect(() => {
        if (user) {
            fetchUserBookings();
        }
    }, [user]);

    return {
        bookings,
        loading,
        error,
        fetchUserBookings,
        fetchMentorBookings,
        isTimeSlotOccupied,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        completeBooking,
        confirmBooking,
    };
};
