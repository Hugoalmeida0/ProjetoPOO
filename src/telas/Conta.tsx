import Header from "@/componentes/Header";
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

    return (
        <div>
            <Header />
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
                        <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={loading}>
                                Salvar
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                                Excluir conta
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Account;
