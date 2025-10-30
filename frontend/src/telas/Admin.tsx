import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAutenticacao";
import { useAdmin } from "@/hooks/useAdmin";
import Header from "@/componentes/Cabecalho";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentes/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table";
import { Badge } from "@/componentes/ui/badge";
import { Download, Users, Calendar, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";
import * as XLSX from "xlsx";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  "in-progress": "secondary",
  completed: "default",
  cancelled: "destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  "in-progress": "Em Andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { users, mentorships, loadingUsers, loadingMentorships } = useAdmin();

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const exportUsersToExcel = () => {
    const data = users.map((user) => ({
      ID: user.id,
      Email: user.email,
      "Nome Completo": user.full_name || "N/A",
      "É Mentor": user.is_mentor ? "Sim" : "Não",
      Telefone: user.phone || "N/A",
      Localização: user.location || "N/A",
      "Anos de Experiência": user.experience_years || "N/A",
      "Avaliação Média": user.avg_rating ? user.avg_rating.toFixed(2) : "N/A",
      "Total de Avaliações": user.total_ratings || 0,
      Graduação: user.graduation_name || "N/A",
      "Data de Cadastro": format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuários");

    // Ajustar largura das colunas
    const cols = [
      { wch: 36 }, // ID
      { wch: 30 }, // Email
      { wch: 25 }, // Nome
      { wch: 10 }, // É Mentor
      { wch: 15 }, // Telefone
      { wch: 20 }, // Localização
      { wch: 18 }, // Anos Exp
      { wch: 15 }, // Avaliação
      { wch: 18 }, // Total Aval
      { wch: 25 }, // Graduação
      { wch: 18 }, // Data Cadastro
    ];
    worksheet["!cols"] = cols;

    XLSX.writeFile(workbook, `usuarios_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`);
  };

  const exportMentorshipsToExcel = () => {
    const data = mentorships.map((m) => ({
      ID: m.id,
      Data: format(new Date(m.date), "dd/MM/yyyy", { locale: ptBR }),
      Hora: m.time,
      "Duração (min)": m.duration,
      Status: statusLabels[m.status] || m.status,
      "Nome do Estudante": m.student_full_name || m.student_name,
      "Email do Estudante": m.student_user_email || m.student_email,
      "Telefone do Estudante": m.student_phone || "N/A",
      "Nome do Mentor": m.mentor_full_name || "N/A",
      "Email do Mentor": m.mentor_email || "N/A",
      Matéria: m.subject_name || "N/A",
      Graduação: m.graduation_name || "N/A",
      Objetivo: m.objective || "N/A",
      "Motivo do Cancelamento": m.cancel_reason || "N/A",
      Avaliação: m.rating || "N/A",
      "Comentário da Avaliação": m.rating_comment || "N/A",
      "Criada em": format(new Date(m.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      "Atualizada em": format(new Date(m.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mentorias");

    // Ajustar largura das colunas
    const cols = [
      { wch: 36 }, // ID
      { wch: 12 }, // Data
      { wch: 8 },  // Hora
      { wch: 12 }, // Duração
      { wch: 12 }, // Status
      { wch: 25 }, // Nome Estudante
      { wch: 30 }, // Email Estudante
      { wch: 15 }, // Telefone Estudante
      { wch: 25 }, // Nome Mentor
      { wch: 30 }, // Email Mentor
      { wch: 25 }, // Matéria
      { wch: 25 }, // Graduação
      { wch: 40 }, // Objetivo
      { wch: 40 }, // Motivo Cancel
      { wch: 10 }, // Avaliação
      { wch: 50 }, // Comentário
      { wch: 18 }, // Criada em
      { wch: 18 }, // Atualizada em
    ];
    worksheet["!cols"] = cols;

    XLSX.writeFile(workbook, `mentorias_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`);
  };

  if (authLoading || !user?.is_admin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-muted-foreground">Gerencie usuários e mentorias do sistema</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="mentorships" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mentorias
            </TabsTrigger>
          </TabsList>

          {/* Aba de Usuários */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                    <CardDescription>
                      Total de {users.length} usuário{users.length !== 1 ? "s" : ""} no sistema
                    </CardDescription>
                  </div>
                  <Button onClick={exportUsersToExcel} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Graduação</TableHead>
                          <TableHead>Avaliação</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Cadastrado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.full_name || "Não informado"}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.is_mentor ? (
                                <Badge variant="default">Mentor</Badge>
                              ) : (
                                <Badge variant="secondary">Estudante</Badge>
                              )}
                            </TableCell>
                            <TableCell>{user.graduation_name || "N/A"}</TableCell>
                            <TableCell>
                              {user.avg_rating ? (
                                <span className="flex items-center gap-1">
                                  ⭐ {user.avg_rating.toFixed(1)}
                                  <span className="text-xs text-muted-foreground">
                                    ({user.total_ratings})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>{user.phone || "N/A"}</TableCell>
                            <TableCell>
                              {format(new Date(user.created_at), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Mentorias */}
          <TabsContent value="mentorships">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mentorias Realizadas</CardTitle>
                    <CardDescription>
                      Total de {mentorships.length} mentoria{mentorships.length !== 1 ? "s" : ""} registrada
                      {mentorships.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button onClick={exportMentorshipsToExcel} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingMentorships ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : mentorships.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Nenhuma mentoria encontrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Estudante</TableHead>
                          <TableHead>Mentor</TableHead>
                          <TableHead>Matéria</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Avaliação</TableHead>
                          <TableHead>Duração</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mentorships.map((mentorship) => (
                          <TableRow key={mentorship.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {format(new Date(mentorship.date), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {mentorship.time}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {mentorship.student_full_name || mentorship.student_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {mentorship.student_user_email || mentorship.student_email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {mentorship.mentor_full_name || "N/A"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {mentorship.mentor_email || "N/A"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{mentorship.subject_name || "N/A"}</span>
                                {mentorship.graduation_name && (
                                  <span className="text-xs text-muted-foreground">
                                    {mentorship.graduation_name}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusColors[mentorship.status]}>
                                {statusLabels[mentorship.status] || mentorship.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {mentorship.rating ? (
                                <span className="flex items-center gap-1">
                                  ⭐ {mentorship.rating}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>{mentorship.duration} min</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
