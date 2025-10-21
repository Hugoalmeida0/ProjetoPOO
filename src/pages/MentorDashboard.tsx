import Header from '@/components/Header';
import RequireMentor from '@/components/RequireMentor';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { apiClient } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MentorDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <RequireMentor>
            <Header />
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
