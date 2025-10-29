import Cabecalho from '@/componentes/Cabecalho';
import RequireMentor from '@/componentes/RequerMentor';
import { useAuth } from '@/hooks/useAutenticacao';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/integracoes/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import { Button } from '@/componentes/ui/button';
import { CheckCircle, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CancelBookingDialog as DialogoCancelarAgendamento } from '@/componentes/DialogoCancelarAgendamento';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentes/ui/tabs';
import { Label } from '@/componentes/ui/label';
import { Input } from '@/componentes/ui/input';
import { Textarea } from '@/componentes/ui/textarea';
import { Checkbox } from '@/componentes/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentes/ui/select';
import { useGraduations } from '@/hooks/useGraduacoes';
import { Alert, AlertDescription, AlertTitle } from '@/componentes/ui/alert';

export default function MentorDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [hiddenBookings, setHiddenBookings] = useState<string[]>(() => {
        try { const raw = localStorage.getItem('hidden_bookings'); return raw ? JSON.parse(raw) : []; } catch { return []; }
    });
    const { toast } = useToast();

    // Estado do cadastro
    const [profile, setProfile] = useState<any | null>(null);
    const [mentorInfo, setMentorInfo] = useState<any | null>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [formLoading, setFormLoading] = useState(false);
    const [formSaving, setFormSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [incompleteNotified, setIncompleteNotified] = useState(false);

    // Graduações
    const { data: graduations, isLoading: graduationsLoading } = useGraduations();

    // Campos do formulário (pré-preenchidos quando carregar dados)
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [availability, setAvailability] = useState('');
    const [experienceYears, setExperienceYears] = useState<number | ''>('');
    const [graduationId, setGraduationId] = useState<string>('');

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

    useEffect(() => {
        const loadCadastro = async () => {
            if (!user?.id) return;
            try {
                setFormLoading(true);
                const [mentorData, profileData, allSubjects, mentorSubjects] = await Promise.all([
                    apiClient.mentors.getByUserId(user.id).catch(() => null),
                    apiClient.profiles.getByUserId(user.id).catch(() => null),
                    apiClient.subjects.getAll().catch(() => []),
                    apiClient.mentorSubjects.getByMentorId(user.id).catch(() => []),
                ]);
                if (mentorData) setMentorInfo(mentorData);
                if (profileData) setProfile(profileData);
                setSubjects(allSubjects || []);
                // Preferir coluna subjects (mentor_profiles.subjects) para popular seleção inicial.
                let preSelected: string[] = [];
                if (mentorData && mentorData.subjects) {
                    // mentorData.subjects pode ser string com nomes separados por vírgula ou array de nomes
                    const names = typeof mentorData.subjects === 'string'
                        ? mentorData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean)
                        : Array.isArray(mentorData.subjects) ? mentorData.subjects : [];
                    // Mapear nomes para ids usando allSubjects (tolerante a pequenas diferenças)
                    const lowerToId: Record<string, string> = {};
                    for (const s of (allSubjects || [])) {
                        if (s && s.name) lowerToId[String(s.name).toLowerCase()] = s.id;
                    }
                    preSelected = names.map((n: string) => {
                        const key = n.toLowerCase();
                        if (lowerToId[key]) return lowerToId[key];
                        // tentativa fuzzy: encontrar subject cujo nome contenha o token
                        const fuzzy = (allSubjects || []).find((s: any) => String(s.name).toLowerCase().includes(key));
                        return fuzzy ? fuzzy.id : null;
                    }).filter(Boolean) as string[];
                } else {
                    preSelected = (mentorSubjects || []).map((s: any) => s.id);
                }
                setSelectedSubjectIds(preSelected);

                // Notificar uma única vez que o cadastro ainda não foi concluído
                if (!mentorData && !incompleteNotified) {
                    setIncompleteNotified(true);
                    toast({
                        title: 'Cadastro de mentor incompleto',
                        description: 'Preencha seus dados, selecione uma graduação e ao menos uma especialidade para concluir.',
                    });
                }

                // Preencher form com existentes
                setFullName(profileData?.full_name || '');
                setBio(profileData?.bio || '');
                setLocation(mentorData?.location || '');
                setAvailability(mentorData?.availability || '');
                setExperienceYears(typeof mentorData?.experience_years === 'number' ? mentorData?.experience_years : '');
                setGraduationId(mentorData?.graduation_id || '');
            } finally {
                setFormLoading(false);
            }
        };
        loadCadastro();
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

    const handleConfirm = async (bookingId: string) => {
        if (!user?.id) return;
        setActionLoading(bookingId);
        try {
            await apiClient.bookings.updateStatus(bookingId, 'confirmed', undefined, user.id);
            toast({ title: 'Agendamento confirmado' });
            await refresh();
        } catch (err) {
            console.error('Erro ao confirmar:', err);
            toast({ title: 'Erro', description: 'Não foi possível confirmar.', variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (bookingId: string) => {
        if (!user?.id) return;
        setActionLoading(bookingId);
        try {
            await apiClient.bookings.updateStatus(bookingId, 'completed', undefined, user.id);
            toast({ title: 'Mentoria finalizada' });
            await refresh();
        } catch (err) {
            console.error('Erro ao finalizar:', err);
            toast({ title: 'Erro', description: 'Não foi possível finalizar.', variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const persistHidden = (ids: string[]) => {
        setHiddenBookings(ids);
        try { localStorage.setItem('hidden_bookings', JSON.stringify(ids)); } catch { }
    };
    const hideBooking = (id: string) => {
        if (hiddenBookings.includes(id)) return;
        persistHidden([...hiddenBookings, id]);
        toast({ title: 'Removido da lista', description: 'Este agendamento foi ocultado nesta interface.' });
    };

    const toggleSubject = (id: string) => {
        setSelectedSubjectIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSaveCadastro = async () => {
        if (!user?.id) return;
        setFormSaving(true);
        try {
            // Atualizar perfil (nome/bio)
            await apiClient.profiles.update(user.id, {
                full_name: fullName,
                bio,
            });

            // Se mentor não existe, criar primeiro
            if (!mentorInfo) {
                const newMentor = await apiClient.mentors.create({
                    user_id: user.id,
                    location,
                    availability,
                    experience_years: typeof experienceYears === 'number' ? experienceYears : Number(experienceYears) || 0,
                    graduation_id: graduationId || null,
                });
                setMentorInfo(newMentor);
            } else {
                // Atualizar mentor (campos profissionais)
                await apiClient.mentors.update(user.id, {
                    location,
                    availability,
                    experience_years: typeof experienceYears === 'number' ? experienceYears : Number(experienceYears) || 0,
                    graduation_id: graduationId || null,
                });
            }

            // Sincronizar coluna subjects em mentor_profiles (armazenar nomes) e também a tabela de relação para consistência
            try {
                const selectedNames = (selectedSubjectIds || []).map(id => {
                    const found = (subjects || []).find((s: any) => s.id === id);
                    return found ? found.name : null;
                }).filter(Boolean) as string[];

                // Atualizar mentor_profiles.subjects via endpoint de mentors
                const updatedMentor = await apiClient.mentors.update(user.id, {
                    location,
                    availability,
                    experience_years: typeof experienceYears === 'number' ? experienceYears : Number(experienceYears) || 0,
                    graduation_id: graduationId || null,
                    subjects: selectedNames.join(', '),
                });

                // Atualizar relação many-to-many para manter consistência
                await apiClient.mentorSubjects.setSubjects(user.id, selectedSubjectIds);

                // Atualizar estado local para refletir mudanças imediatas na UI
                setMentorInfo(updatedMentor);
                // Se o profile foi modificado em backend, recarregar
                const refreshedProfile = await apiClient.profiles.getByUserId(user.id).catch(() => null);
                if (refreshedProfile) setProfile(refreshedProfile);
            } catch (err) {
                console.warn('Erro ao sincronizar subjects em mentor_profiles/mentor_subjects', err);
            }

            toast({ title: 'Cadastro atualizado', description: 'Suas informações foram salvas.' });
        } catch (err: any) {
            console.error('Erro ao salvar cadastro', err);
            toast({ title: 'Erro', description: err?.message || 'Não foi possível salvar seu cadastro.', variant: 'destructive' });
        } finally {
            setFormSaving(false);
        }
    };

    const subjectsByName = useMemo(() => (subjects || []).sort((a, b) => a.name.localeCompare(b.name)), [subjects]);

    const filteredSubjects = useMemo(() => {
        if (!searchTerm.trim()) return subjectsByName;
        const lower = searchTerm.toLowerCase();
        return subjectsByName.filter((s: any) =>
            s.name.toLowerCase().includes(lower) ||
            (s.description && s.description.toLowerCase().includes(lower))
        );
    }, [subjectsByName, searchTerm]);

    const isSaveDisabled = formSaving || formLoading || !graduationId || selectedSubjectIds.length === 0;

    return (
        <RequireMentor>
            <Cabecalho />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Painel do Mentor</h1>

                <Tabs defaultValue="aulas" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="aulas">Painel de aulas</TabsTrigger>
                        <TabsTrigger value="cadastro">Meu Cadastro</TabsTrigger>
                    </TabsList>

                    <TabsContent value="aulas">
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
                                            {bookings.filter((b) => !hiddenBookings.includes(b.id)).map((b) => (
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
                                                        {b.status === 'pending' && (
                                                            <Button size="sm" variant="secondary" onClick={() => handleConfirm(b.id)} disabled={actionLoading === b.id}>
                                                                Confirmar
                                                            </Button>
                                                        )}
                                                        <Button size="sm" className="ml-2" onClick={() => handleComplete(b.id)} disabled={actionLoading === b.id}>
                                                            <CheckCircle className="h-4 w-4 mr-1" /> Finalizar
                                                        </Button>
                                                        <DialogoCancelarAgendamento
                                                            onConfirm={(msg) => handleCancel(b.id, msg)}
                                                            disabled={actionLoading === b.id}
                                                        />
                                                        {(b.status === 'cancelled' || b.status === 'completed') && (
                                                            <Button variant="ghost" size="sm" className="ml-2" onClick={() => hideBooking(b.id)}>
                                                                <Trash2 className="h-4 w-4 mr-1" /> Remover da lista
                                                            </Button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="cadastro">
                        {!formLoading && !mentorInfo && (
                            <Alert className="mb-4">
                                <AlertTitle>Atenção</AlertTitle>
                                <AlertDescription>
                                    Você ainda não concluiu seu cadastro de mentor. Informe seus dados, selecione uma graduação e ao menos uma especialidade para habilitar o salvamento.
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Pessoais</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {formLoading ? (
                                        <p>Carregando...</p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-2">
                                                <Label htmlFor="full_name">Nome completo</Label>
                                                <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Fale sobre você" rows={4} />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Profissionais</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {formLoading ? (
                                        <p>Carregando...</p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-2">
                                                <Label htmlFor="graduation">Graduação</Label>
                                                <Select value={graduationId} onValueChange={setGraduationId} disabled={graduationsLoading}>
                                                    <SelectTrigger id="graduation">
                                                        <SelectValue placeholder="Selecione uma graduação" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(graduations || []).map((g: any) => (
                                                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Label htmlFor="location">Localidade</Label>
                                                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cidade/Estado" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Label htmlFor="experience_years">Experiência (anos)</Label>
                                                <Input id="experience_years" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))} />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Label htmlFor="availability">Disponibilidade</Label>
                                                <Input id="availability" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Ex.: Seg a Sex, 14h - 18h" />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Especialidades</span>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {selectedSubjectIds.length} selecionada{selectedSubjectIds.length !== 1 ? 's' : ''}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {formLoading ? (
                                        <p>Carregando...</p>
                                    ) : (
                                        <>
                                            <div className="mb-4 relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Buscar especialidades..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                                {filteredSubjects.length === 0 ? (
                                                    <p className="col-span-full text-sm text-muted-foreground">Nenhuma especialidade encontrada.</p>
                                                ) : (
                                                    filteredSubjects.map((s: any) => (
                                                        <label key={s.id} className="flex items-center gap-3 border rounded p-3 hover:bg-muted/50 cursor-pointer">
                                                            <Checkbox checked={selectedSubjectIds.includes(s.id)} onCheckedChange={() => toggleSubject(s.id)} />
                                                            <div>
                                                                <div className="font-medium">{s.name}</div>
                                                                {s.description ? (
                                                                    <div className="text-xs text-muted-foreground line-clamp-2">{s.description}</div>
                                                                ) : null}
                                                            </div>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    )}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-3">
                                        <p className="text-sm text-muted-foreground">
                                            {(!graduationId || selectedSubjectIds.length === 0) ? 'Selecione uma graduação e ao menos uma especialidade para salvar.' : 'Pronto para salvar.'}
                                        </p>
                                        <Button onClick={handleSaveCadastro} disabled={isSaveDisabled}>
                                            {formSaving ? 'Salvando...' : 'Salvar cadastro'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </RequireMentor>
    );
}
