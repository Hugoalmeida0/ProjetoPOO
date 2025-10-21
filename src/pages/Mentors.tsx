import React, { useState } from 'react';
import useMentors from '@/hooks/useMentors';
import MentorCard from '@/components/MentorCard';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Mentors = () => {
    const { mentors, loading, error, createMentor, updateMentor, deleteMentor, fetchMentors } = useMentors();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [form, setForm] = useState({ user_id: '', graduation_id: '', location: '', availability: '', experience_years: '', price_per_hour: '', bio: '' });

    const openCreate = () => {
        setForm({ user_id: '', graduation_id: '', location: '', availability: '', experience_years: '', price_per_hour: '', bio: '' });
        setEditingUserId(null);
        setIsFormOpen(true);
    };

    const openEdit = (m: any) => {
        setForm({ user_id: m.user_id || '', graduation_id: m.graduation_id || '', location: m.location || '', availability: m.availability || '', experience_years: String(m.experience_years || ''), price_per_hour: String(m.price_per_hour || ''), bio: m.bio || '' });
        setEditingUserId(m.user_id);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUserId) {
                await updateMentor(editingUserId, { graduation_id: form.graduation_id || null, location: form.location, availability: form.availability, experience_years: Number(form.experience_years || 0), price_per_hour: Number(form.price_per_hour || 0) });
                toast({ title: 'Sucesso', description: 'Mentor atualizado' });
            } else {
                if (!form.user_id) throw new Error('user_id é obrigatório');
                await createMentor({ user_id: form.user_id, graduation_id: form.graduation_id || null, location: form.location, availability: form.availability, experience_years: Number(form.experience_years || 0), price_per_hour: Number(form.price_per_hour || 0) });
                toast({ title: 'Sucesso', description: 'Mentor criado' });
            }
            setIsFormOpen(false);
            fetchMentors();
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message || 'Erro ao salvar mentor', variant: 'destructive' });
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Deseja realmente remover este mentor?')) return;
        try {
            await deleteMentor(userId);
            toast({ title: 'Removido', description: 'Mentor removido com sucesso' });
            fetchMentors();
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message || 'Erro ao remover mentor', variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Mentores</h1>
                <Button onClick={openCreate}>Novo Mentor</Button>
            </div>

            {isFormOpen && (
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">{editingUserId ? 'Editar Mentor' : 'Criar Mentor'}</h2>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {!editingUserId && (
                                <div>
                                    <Label htmlFor="user_id">User ID (UUID)</Label>
                                    <Input id="user_id" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required />
                                </div>
                            )}
                            <div>
                                <Label htmlFor="graduation_id">Graduação (ID)</Label>
                                <Input id="graduation_id" value={form.graduation_id} onChange={(e) => setForm({ ...form, graduation_id: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="location">Localização</Label>
                                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="availability">Disponibilidade</Label>
                                <Input id="availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="experience_years">Anos de experiência</Label>
                                <Input id="experience_years" type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="price_per_hour">Preço por hora</Label>
                                <Input id="price_per_hour" type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="bio">Biografia</Label>
                                <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Salvar</Button>
                                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading && <p>Carregando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mentors.map((m: any) => (
                    <div key={m.id}>
                        <MentorCard
                            name={m.profiles?.full_name || 'Sem nome'}
                            course={m.profiles?.graduation || 'N/A'}
                            period={'--'}
                            subjects={[]}
                            rating={m.rating || 0}
                            reviews={m.total_sessions || 0}
                            location={m.location || '-'}
                            avatar={m.profiles?.avatar_url}
                        />
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(m)}>Editar</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(m.user_id)}>Remover</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Mentors;
