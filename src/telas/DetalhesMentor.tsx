import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, GraduationCap, Clock, User, MessageCircle, Calendar, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Cabecalho from "@/componentes/Cabecalho";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/componentes/ui/avatar";
import { Separator } from "@/componentes/ui/separator";
import { apiClient } from "@/integracoes/api/client";
import { useToast } from "@/hooks/use-toast";
import useMentors from "@/hooks/useMentores";

const MentorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getMentor } = useMentors();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [mentorSubjects, setMentorSubjects] = useState<any[]>([]);

  useEffect(() => {
    const loadMentor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [mentorData, profileData, bookingsData, subjectsData] = await Promise.all([
          getMentor(id).catch(() => null),
          apiClient.profiles.getByUserId(id).catch(() => null),
          apiClient.bookings.getByMentorId(id).catch(() => []),
          apiClient.mentorSubjects.getByMentorId(id).catch(() => []),
        ]);
        if (!mentorData || !profileData) {
          throw new Error('Mentor não encontrado');
        }
        setMentor({ ...mentorData, profiles: profileData });

        // Especialidades
        setMentorSubjects(subjectsData || []);

        // Contar sessões exceto as canceladas
        const completedCount = (bookingsData || []).filter((b: any) => b.status !== 'cancelled').length;
        setCompletedSessions(completedCount);
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao carregar dados do mentor',
          variant: 'destructive',
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    loadMentor();
  }, [id, toast, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!mentor || !id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">Mentor não encontrado</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const initials = (mentor.profiles?.full_name || 'M').split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />

      <section className="py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                      <AvatarImage src={mentor.profiles?.avatar_url} alt={mentor.profiles?.full_name} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{mentor.profiles?.full_name || 'Mentor'}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <GraduationCap className="h-4 w-4" />
                        <span>{mentor.profiles?.graduation || 'Graduação'} {mentor.experience_years ? `- ${mentor.experience_years} anos exp.` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{mentor.location || '--'}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">{(mentor.avg_rating ?? 0).toFixed(1)}</span>
                          <span className="text-muted-foreground">({mentor.total_ratings ?? 0} avaliações)</span>
                        </div>
                        <div className="px-4 py-2 bg-gradient-primary text-white rounded-lg text-center">
                          <span className="font-bold">R$ {typeof mentor.price_per_hour === 'number' ? mentor.price_per_hour.toFixed(2) : '0.00'}/hora</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Sobre</h3>
                      <p className="text-muted-foreground leading-relaxed">{mentor.profiles?.bio || 'Sem biografia cadastrada.'}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Disponibilidade</h3>
                      <Badge variant="secondary">{mentor.availability || 'Flexível'}</Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Especialidades</h3>
                      {(() => {
                        // Preferir coluna subjects de mentor_profiles quando disponível
                        let subjectsFromProfile: string[] = [];
                        if (mentor?.subjects) {
                          if (typeof mentor.subjects === 'string') {
                            subjectsFromProfile = mentor.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
                          } else if (Array.isArray(mentor.subjects)) {
                            subjectsFromProfile = mentor.subjects as string[];
                          }
                        }

                        const fallback = mentorSubjects || [];
                        const toDisplay = subjectsFromProfile.length > 0 ? subjectsFromProfile : fallback.map((s: any) => s.name || s);

                        if (!toDisplay || toDisplay.length === 0) {
                          return <p className="text-muted-foreground">Nenhuma especialidade cadastrada.</p>;
                        }

                        return (
                          <div className="flex flex-wrap gap-2">
                            {toDisplay.map((s: any, idx: number) => (
                              <Badge key={s.id || s.name || idx} variant="secondary">{s}</Badge>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials removido temporariamente (pode ser adicionado após implementar reviews) */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm">Sessões realizadas</span>
                      </div>
                      <span className="font-bold">{completedSessions}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm">Experiência</span>
                      </div>
                      <span className="font-bold">{mentor.experience_years || 0} anos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Disponibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{mentor.availability || 'Flexível'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate(`/agendar/${id}`)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Mentoria
                </Button>
                {/* Botão 'Enviar Mensagem' removido da interface conforme solicitado */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MentorDetails;