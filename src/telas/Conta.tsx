import Cabecalho from "@/componentes/Cabecalho";
import { Button } from "@/componentes/ui/button";
import { Switch } from "@/componentes/ui/switch";
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

    const handleToggleMentor = async (value: boolean) => {
        if (!user) return;
        try {
            setLoading(true);
            // Apenas atualizar flag is_mentor no profile para permitir reativação posterior
            await apiClient.profiles.update(user.id, { is_mentor: value });
            // atualizar estado local
            setProfile((p: any) => ({ ...(p || {}), is_mentor: value }));
            toast({ title: value ? 'Você é mentor novamente' : 'Você não é mais mentor', description: value ? 'Seu perfil de mentor foi reativado.' : 'Seu perfil de mentor foi desativado.' });
            // Atualizar contexto: recarregar para garantir rotas/menus atualizados.
            // Preferimos reload simples aqui; posso implementar refresh via AuthProvider se preferir.
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
                            {(profile || user) && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm">Sou Mentor</label>
                                    <Switch
                                        checked={Boolean(profile?.is_mentor || user?.is_mentor)}
                                        onCheckedChange={(v: any) => handleToggleMentor(Boolean(v))}
                                        disabled={loading}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Account;
