import React, { useEffect, useMemo, useState } from 'react';
import useMentors from '@/hooks/useMentores';
import MentorCard from '@/componentes/CardMentor';
import { Alert, AlertDescription, AlertTitle } from '@/componentes/ui/alert';
import { Button } from '@/componentes/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAutenticacao';
import { apiClient } from '@/integracoes/api/client';
import { useNavigate } from 'react-router-dom';

const Mentors = () => {
    const { mentors, loading, error } = useMentors();
    const { toast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Alerta para mentor logado com cadastro incompleto
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [checkedProfile, setCheckedProfile] = useState(false);

    useEffect(() => {
        const checkMentorProfile = async () => {
            if (!user?.is_mentor || !user?.id) { setCheckedProfile(true); return; }
            try {
                const [mentor, profile] = await Promise.all([
                    apiClient.mentors.getByUserId(user.id).catch(() => null),
                    apiClient.profiles.getByUserId(user.id).catch(() => null),
                ]);
                const missing: string[] = [];
                if (!profile?.full_name) missing.push('Nome completo');
                if (!profile?.email) missing.push('Email');
                if (!mentor?.location) missing.push('Localização');
                if (!mentor?.price_per_hour || mentor?.price_per_hour <= 0) missing.push('Preço por hora');
                if (!mentor?.availability) missing.push('Disponibilidade');
                if (!mentor?.experience_years || mentor?.experience_years <= 0) missing.push('Anos de experiência');
                setMissingFields(missing);
            } catch (err: any) {
                console.error('Erro ao validar perfil do mentor', err);
                toast({ title: 'Erro', description: 'Falha ao validar seu cadastro de mentor' });
            } finally {
                setCheckedProfile(true);
            }
        };
        checkMentorProfile();
    }, [user?.id, user?.is_mentor, toast]);

    // Filtrar somente mentores com dados mínimos (nome e preço)
    const visibleMentors = useMemo(() => {
        return mentors.filter((m: any) => {
            const hasName = !!(m.profiles?.full_name && String(m.profiles.full_name).trim());
            const hasPrice = typeof m.price_per_hour === 'number' && m.price_per_hour > 0;
            return hasName && hasPrice;
        });
    }, [mentors]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Mentores</h1>
            </div>

            {/* Alerta de cadastro incompleto para mentor logado */}
            {checkedProfile && user?.is_mentor && missingFields.length > 0 && (
                <Alert className="mb-4">
                    <AlertTitle>Complete seu cadastro de mentor</AlertTitle>
                    <AlertDescription>
                        Para aparecer na lista e receber agendamentos, finalize os campos: {missingFields.join(', ')}.
                        <Button variant="link" className="pl-2" onClick={() => navigate('/account')}>Ir para Minha Conta</Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* CRUD de mentor removido da UI pública */}

            {loading && <p>Carregando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleMentors.map((m: any) => (
                    <div key={m.id}>
                        <MentorCard
                            mentorId={m.user_id}
                            name={m.profiles?.full_name || 'Sem nome'}
                            course={m.profiles?.graduation || 'N/A'}
                            period={m.experience_years ? `${m.experience_years} anos exp.` : '--'}
                            subjects={[]}
                            rating={Number(m.avg_rating) || 0}
                            reviews={Number(m.total_ratings) || 0}
                            location={m.location || '-'}
                            avatar={m.profiles?.avatar_url}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Mentors;
