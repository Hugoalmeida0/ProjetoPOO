import React, { useEffect, useMemo, useState } from 'react';
import useMentors from '@/hooks/useMentores';
import MentorCard from '@/componentes/CardMentor';
import { Alert, AlertDescription, AlertTitle } from '@/componentes/ui/alert';
import { Button } from '@/componentes/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAutenticacao';
import { apiClient } from '@/integracoes/api/client';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/componentes/ui/input';
import { cn } from '@/lib/utils';

const Mentors = () => {
    const { mentors, loading, error } = useMentors();
    const { toast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Filtros
    const [subjectQuery, setSubjectQuery] = useState('');
    const [subjectSuggestions, setSubjectSuggestions] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

    const [graduationQuery, setGraduationQuery] = useState('');
    const [graduationSuggestions, setGraduationSuggestions] = useState<string[]>([]);

    const [mentorSubjectsMap, setMentorSubjectsMap] = useState<Record<string, any[]>>({});

    // (Removido) alerta de cadastro incompleto exibido indevidamente nesta rota.

    // Lista base: mostrar todos os mentores cadastrados (catálogo completo)
    const allMentors = mentors || [];

    // Buscar lista de matérias para autocomplete
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const subs = await apiClient.subjects.getAll();
                if (mounted) setSubjectSuggestions(subs || []);
            } catch (e) {
                console.debug('Erro ao buscar subjects para autocomplete', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Derivar opções de graduação a partir dos perfis dos mentores
    useEffect(() => {
        const grads = Array.from(new Set((mentors || []).map((m: any) => m.profiles?.graduation).filter(Boolean)));
        setGraduationSuggestions(grads as string[]);
    }, [mentors]);

    // Quando um assunto é selecionado, popular mentorSubjectsMap (para filtrar)
    useEffect(() => {
        if (!selectedSubject) {
            setMentorSubjectsMap({});
            return;
        }
        let mounted = true;
        (async () => {
            try {
                const entries = await Promise.all(allMentors.map(async (m: any) => {
                    try {
                        const subs = await apiClient.mentorSubjects.getByMentorId(m.user_id || m.id);
                        return [m.user_id || m.id, subs || []] as const;
                    } catch (e) {
                        return [m.user_id || m.id, []] as const;
                    }
                }));
                if (!mounted) return;
                const map: Record<string, any[]> = {};
                for (const [k, v] of entries) map[k as string] = v as any[];
                setMentorSubjectsMap(map);
            } catch (e) {
                console.debug('Erro ao popular mentorSubjectsMap', e);
            }
        })();
        return () => { mounted = false; };
    }, [selectedSubject, allMentors]);

    // Pré-popular especialidades para os mentores visíveis (para exibir em cards)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const toFetch = (allMentors || []).slice(0, 50); // limite para evitar flood
                const entries = await Promise.all(toFetch.map(async (m: any) => {
                    try {
                        const subs = await apiClient.mentorSubjects.getByMentorId(m.user_id || m.id);
                        return [m.user_id || m.id, subs || []] as const;
                    } catch (e) {
                        return [m.user_id || m.id, []] as const;
                    }
                }));
                if (!mounted) return;
                const map: Record<string, any[]> = { ...mentorSubjectsMap };
                for (const [k, v] of entries) map[k as string] = v as any[];
                setMentorSubjectsMap(map);
            } catch (e) {
                console.debug('Erro ao pré-popular mentorSubjectsMap', e);
            }
        })();
        return () => { mounted = false; };
    }, [allMentors]);

    // Aplicar filtros (nome da matéria e graduação)
    const visibleMentors = useMemo(() => {
        let list = allMentors.slice();

        if (graduationQuery) {
            const q = String(graduationQuery).toLowerCase();
            list = list.filter((m: any) => String(m.profiles?.graduation || '').toLowerCase().includes(q));
        }

        if (selectedSubject) {
            const subjectId = selectedSubject.id || selectedSubject._id || null;
            if (subjectId) {
                list = list.filter((m: any) => {
                    const key = m.user_id || m.id;
                    const subs = mentorSubjectsMap[key] || [];
                    return subs.some((s: any) => String(s.id) === String(subjectId) || String(s.name).toLowerCase() === String(selectedSubject.name || '').toLowerCase());
                });
            } else {
                const name = (selectedSubject.name || selectedSubject).toLowerCase();
                list = list.filter((m: any) => {
                    const key = m.user_id || m.id;
                    const subs = mentorSubjectsMap[key] || [];
                    return subs.some((s: any) => String(s.name || '').toLowerCase().includes(name));
                });
            }
        }

        return list;
    }, [allMentors, graduationQuery, selectedSubject, mentorSubjectsMap]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Mentores</h1>
                <div>
                    <Button variant="ghost" onClick={() => navigate('/')}>Voltar à Home</Button>
                </div>
            </div>

            {/* Alerta removido: verificação de perfil de mentor era feita em outro lugar (Painel do Mentor) */}

            {/* CRUD de mentor removido da UI pública */}

            {/* Filtros: Matéria (autocomplete) e Graduação */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="relative">
                    <label className="text-sm text-muted-foreground">Nome da Matéria</label>
                    <Input
                        placeholder="Digite uma matéria..."
                        value={subjectQuery}
                        onChange={(e) => {
                            setSubjectQuery((e.target as HTMLInputElement).value);
                            setSelectedSubject(null);
                        }}
                    />
                    {subjectQuery && (
                        <div className="absolute z-40 mt-1 w-full bg-card border rounded shadow-sm max-h-48 overflow-auto">
                            {subjectSuggestions
                                .filter(s => String(s.name || s).toLowerCase().includes(subjectQuery.toLowerCase()))
                                .slice(0, 8)
                                .map((s: any) => (
                                    <div
                                        key={s.id || s.name}
                                        className="px-3 py-2 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => {
                                            setSelectedSubject(s);
                                            setSubjectQuery(s.name || s);
                                        }}
                                    >
                                        {s.name || s}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <label className="text-sm text-muted-foreground">Busca por Graduação</label>
                    <Input
                        placeholder="Digite uma graduação..."
                        value={graduationQuery}
                        onChange={(e) => setGraduationQuery((e.target as HTMLInputElement).value)}
                    />
                    {graduationQuery && (
                        <div className="absolute z-40 mt-1 w-full bg-card border rounded shadow-sm max-h-48 overflow-auto">
                            {graduationSuggestions
                                .filter(g => String(g).toLowerCase().includes(graduationQuery.toLowerCase()))
                                .slice(0, 8)
                                .map((g: any) => (
                                    <div
                                        key={g}
                                        className="px-3 py-2 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => setGraduationQuery(g)}
                                    >
                                        {g}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 items-end">
                    <Button variant="outline" onClick={() => { setSubjectQuery(''); setSelectedSubject(null); setGraduationQuery(''); setMentorSubjectsMap({}); }}>
                        Limpar filtros
                    </Button>
                </div>
            </div>

            {loading && <p>Carregando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleMentors.map((m: any) => (
                    <div key={m.id}>
                        {(() => {
                            // Preferir coluna subjects de mentor_profiles quando disponível
                            let subjectsFromProfile: string[] = [];
                            if (m.subjects) {
                                if (typeof m.subjects === 'string') {
                                    subjectsFromProfile = m.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
                                } else if (Array.isArray(m.subjects)) {
                                    subjectsFromProfile = m.subjects as string[];
                                }
                            }

                            const fallbackSubjects = (mentorSubjectsMap[m.user_id || m.id] || []).map((s: any) => s.name || s);
                            const displaySubjects = subjectsFromProfile.length > 0 ? subjectsFromProfile : fallbackSubjects;

                            return (
                                <MentorCard
                                    mentorId={m.user_id}
                                    name={m.profiles?.full_name || 'Sem nome'}
                                    course={m.profiles?.graduation || 'N/A'}
                                    period={m.experience_years ? `${m.experience_years} anos exp.` : '--'}
                                    subjects={displaySubjects}
                                    rating={m.avg_rating ?? 0}
                                    reviews={m.total_ratings ?? 0}
                                    location={m.location || '-'}
                                    avatar={m.profiles?.avatar_url}
                                />
                            );
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Mentors;
