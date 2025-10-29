import Cabecalho from "@/componentes/Cabecalho";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { useAuth } from "@/hooks/useAutenticacao";
import { apiClient } from "@/integracoes/api/client";
import { useEffect, useState } from "react";
import { toast } from "@/componentes/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Account = () => {
    const { user, signOut } = useAuth();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        const load = async () => {
            try {
                const me = await apiClient.users.getMe();
                setFullName(me.full_name || user?.full_name || "");
                setEmail(me.email || user?.email || "");

                // carregar profile (opcional) para mostrar mais campos da conta
                try {
                    const prof = await apiClient.profiles.getByUserId(user!.id);
                    setProfile(prof);
                } catch (err) {
                    // perfil pode não existir ainda; ignorar
                    setProfile(null);
                }
            } catch (e: any) {
                toast({ title: "Erro ao carregar conta", description: e?.message || "" });
            }
        };
        load();
    }, [user]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const updated = await apiClient.users.updateMe({ full_name: fullName, email });
            toast({ title: "Conta atualizada", description: `${updated.full_name} (${updated.email})` });
        } catch (e: any) {
            toast({ title: "Erro ao atualizar", description: e?.message || "" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirm = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");
        if (!confirm) return;
        try {
            setLoading(true);
            await apiClient.users.deleteMe();
            toast({ title: "Conta excluída" });
            await signOut();
            navigate("/");
        } catch (e: any) {
            toast({ title: "Erro ao excluir conta", description: e?.message || "" });
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveMentor = async () => {
        if (!user) return;
        const ok = window.confirm('Tem certeza que deseja parar de ser mentor? Seu perfil de mentor será removido e você perderá acesso às telas de mentor.');
        if (!ok) return;

        try {
            setLoading(true);
            // 1) remover mentor_profile (se existir)
            try {
                await apiClient.mentors.delete(user.id);
            } catch (err: any) {
                // se retornar 404 ou outro erro, continuar para atualizar o profile
                console.warn('Erro ao deletar mentor_profile (pode não existir):', err?.message || err);
            }

            // 2) atualizar profile.is_mentor = false
            try {
                await apiClient.profiles.update(user.id, { is_mentor: false });
            } catch (err: any) {
                console.warn('Erro ao atualizar profile.is_mentor:', err?.message || err);
            }

            toast({ title: 'Você não é mais mentor', description: 'Seu perfil de mentor foi removido.' });
            // força recarregamento para atualizar contexto de autenticação e rotas
            window.location.reload();
        } catch (e: any) {
            toast({ title: 'Erro ao processar', description: e?.message || '' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Cabecalho />
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Minha conta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm">Nome completo</label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" />
                        </div>
                        <div>
                            <label className="text-sm">Email</label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" />
                        </div>
                        {profile && (
                            <>
                                <div>
                                    <label className="text-sm">Telefone</label>
                                    <Input value={profile.phone || ''} disabled />
                                </div>
                                <div>
                                    <label className="text-sm">Bio</label>
                                    <Input value={profile.bio || ''} disabled />
                                </div>
                                <div>
                                    <label className="text-sm">Mentor?</label>
                                    <div className="text-sm">{profile.is_mentor ? 'Sim' : 'Não'}</div>
                                </div>
                            </>
                        )}
                        <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={loading}>
                                Salvar
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                                Excluir conta
                            </Button>
                            {(profile?.is_mentor || user?.is_mentor) && (
                                <Button variant="outline" onClick={handleLeaveMentor} disabled={loading}>
                                    Parar de ser Mentor
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Account;
