import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Cabecalho from "@/componentes/Cabecalho";
import SubjectCard from "@/componentes/CardDisciplina";
import MentorCard from "@/componentes/CardMentor";
import { Button } from "@/componentes/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/componentes/ui/alert";
import { useGraduations } from "@/hooks/useGraduacoes";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/integracoes/api/client";
import { 
  Calculator, 
  Atom, 
  Laptop, 
  PenTool, 
  Globe, 
  TrendingUp,
  Building,
  Zap,
  Wrench,
  Heart,
  Scale,
  Briefcase
} from "lucide-react";

const GraduationDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: graduations = [], isLoading: loadingGraduations } = useGraduations();
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [subjects, setSubjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const graduation = useMemo(() => graduations.find((g: any) => g.slug === slug), [graduations, slug]);

  useEffect(() => {
    const load = async () => {
      if (!graduation?.id) return;
      try {
        setLoadingSubjects(true);
        const res = await apiClient.subjects.getByGraduation(graduation.id, page, pageSize);
        setSubjects(res.items || []);
        setTotal(res.total || 0);
      } finally {
        setLoadingSubjects(false);
      }
    };
    load();
  }, [graduation?.id, page]);

  if (loadingGraduations) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-xl">Carregando graduação...</h1>
        </div>
      </div>
    );
  }

  if (!graduation) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Graduação não encontrada</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-8 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às Graduações
          </Button>
          
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {graduation.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
              {graduation.description}
            </p>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Matérias Disponíveis</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encontre mentores especializados nas disciplinas de {graduation.name}
            </p>
          </div>
          {loadingSubjects ? (
            <p className="text-center">Carregando matérias...</p>
          ) : subjects.length === 0 ? (
            <Alert className="max-w-3xl mx-auto">
              <AlertTitle>Nenhuma matéria com monitores vinculados</AlertTitle>
              <AlertDescription>
                Ainda não há especialidades cadastradas por monitores nesta graduação. Se você é monitor,
                acesse a aba <strong>Meu Cadastro</strong> no Painel do Mentor e selecione suas especialidades.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {subjects.map((subject: any) => (
                  <SubjectCard
                    key={subject.id}
                    name={subject.name}
                    description={subject.description}
                    mentors={undefined}
                    duration={undefined}
                    rating={undefined}
                    color="bg-primary/10 text-primary"
                    icon={<Laptop className="h-6 w-6" />}
                  />
                ))}
              </div>
              {total > pageSize && (
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">Página {page} de {Math.ceil(total / pageSize)}</span>
                  <Button variant="outline" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((p) => p + 1)}>
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Mentores em destaque removido temporariamente até conectarmos fonte real */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Encontre seu Mentor</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Conecte-se com os melhores mentores de {graduation.name} e acelere seu aprendizado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
              Encontrar Mentor
            </Button>
            <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">
              Ser Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GraduationDetails;