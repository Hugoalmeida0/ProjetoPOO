import Cabecalho from '@/componentes/Cabecalho';
import RequireMentor from '@/componentes/RequerMentor';
import { useAuth } from '@/hooks/useAutenticacao';
import { useEffect, useState } from 'react';
import { apiClient } from '@/integracoes/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CancelBookingDialog as DialogoCancelarAgendamento } from '@/componentes/DialogoCancelarAgendamento';

export default function MentorDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const load = async () => {
            if (!user?.id) return;
            try {
                const res = await apiClient.bookings.getByMentorId(user.id);
                setBookings(res);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.id]);

    const refresh = async () => {
        if (!user?.id) return;
        const res = await apiClient.bookings.getByMentorId(user.id);
        setBookings(res);
    };

    const handleCancel = async (bookingId: string, message: string) => {
        if (!user?.id) return;
        setActionLoading(bookingId);
        try {
            await apiClient.bookings.updateStatus(bookingId, 'cancelled', message, user.id);
            toast({
                title: 'Agendamento cancelado',
                description: 'Uma notificação foi enviada ao outro participante.',
            });
            await refresh();
        } catch (err) {
            console.error('Erro ao cancelar:', err);
            toast({ title: 'Erro', description: 'Não foi possível cancelar.', variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <RequireMentor>
            <Cabecalho />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Painel do Mentor</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Próximas Aulas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p>Carregando...</p>
                            ) : bookings.length === 0 ? (
                                <p>Nenhuma aula agendada.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {bookings.map((b) => (
                                        <li key={b.id} className="border rounded p-3">
                                            <div className="font-medium">{b.date} {b.time} · {b.duration}min</div>
                                            <div className="text-sm text-muted-foreground">Aluno: {b.student_name} | Status: {b.status}</div>
                                            {b.status === 'cancelled' && b.cancel_reason && (
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium text-red-600">Motivo do cancelamento: </span>
                                                    <span className="text-muted-foreground">{b.cancel_reason}</span>
                                                </div>
                                            )}
                                            {/* Ação de cancelar direto do painel */}
                                            <div className="mt-3">
                                                <DialogoCancelarAgendamento
                                                    onConfirm={(msg) => handleCancel(b.id, msg)}
                                                    disabled={actionLoading === b.id}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RequireMentor>
    );
}
