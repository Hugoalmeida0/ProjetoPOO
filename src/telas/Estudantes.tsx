import React, { useState } from 'react';
import { useStudents } from '@/hooks/useEstudantes';
import Cabecalho from '@/componentes/Cabecalho';
import { Card, CardContent, CardHeader } from '@/componentes/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import { Textarea } from '@/componentes/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Students = () => {
    const { students, loading, error, createStudent, updateStudentByUserId, deleteStudentByUserId, fetchStudents } = useStudents();
    const { toast } = useToast();

    const [isCreating, setIsCreating] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [form, setForm] = useState({ user_id: '', full_name: '', email: '', phone: '', bio: '', avatar_url: '' });

    const openCreate = () => {
        setForm({ user_id: '', full_name: '', email: '', phone: '', bio: '', avatar_url: '' });
        setEditingUserId(null);
        setIsCreating(true);
    };

    const openEdit = (s: any) => {
        setForm({ user_id: s.user_id || '', full_name: s.full_name || '', email: s.email || '', phone: s.phone || '', bio: s.bio || '', avatar_url: s.avatar_url || '' });
        setEditingUserId(s.user_id);
        setIsCreating(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUserId) {
                await updateStudentByUserId(editingUserId, { full_name: form.full_name, email: form.email, phone: form.phone, bio: form.bio, avatar_url: form.avatar_url });
                toast({ title: 'Sucesso', description: 'Estudante atualizado' });
            } else {
                if (!form.user_id) throw new Error('user_id é obrigatório');
                await createStudent({ user_id: form.user_id, full_name: form.full_name, email: form.email, phone: form.phone, bio: form.bio, avatar_url: form.avatar_url });
                toast({ title: 'Sucesso', description: 'Estudante criado' });
            }
            setIsCreating(false);
            fetchStudents();
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message || 'Erro ao salvar estudante', variant: 'destructive' });
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Deseja realmente remover este estudante?')) return;
        try {
            await deleteStudentByUserId(userId);
            toast({ title: 'Removido', description: 'Estudante removido com sucesso' });
            fetchStudents();
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message || 'Erro ao remover estudante', variant: 'destructive' });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Cabecalho />
            <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Estudantes</h1>
                    <p className="text-muted-foreground">Gerenciar cadastro de estudantes</p>
                </div>
                <Button onClick={openCreate}>Novo Estudante</Button>
            </div>

            {isCreating && (
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">{editingUserId ? 'Editar Estudante' : 'Criar Estudante'}</h2>
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
                                <Label htmlFor="full_name">Nome</Label>
                                <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="avatar_url">Avatar URL</Label>
                                <Input id="avatar_url" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Salvar</Button>
                                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading && <p>Carregando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {students.map((s: any) => (
                    <Card key={s.id}>
                        <CardHeader className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={s.avatar_url} alt={s.full_name || 'Aluno'} />
                                <AvatarFallback>{(s.full_name || 'A').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold">{s.full_name}</div>
                                <div className="text-sm text-muted-foreground">{s.email}</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{s.bio}</p>
                            <div className="mt-4 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openEdit(s)}>Editar</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(s.user_id)}>Remover</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            </div>
        </div>
    );
};

export default Students;
