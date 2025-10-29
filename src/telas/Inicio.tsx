import Cabecalho from "@/componentes/Cabecalho";
import Hero from "@/componentes/Heroi";
import MentorCard from "@/componentes/CardMentor";
import { Button } from "@/componentes/ui/button";
// Graduation section removed per request
import useMentors from "@/hooks/useMentores";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getFeaturedMentors } from "@/lib/mentors";
import {
  Calculator,
  Atom,
  Laptop,
  PenTool,
  Globe,
  TrendingUp,
  ArrowRight,
  Zap,
  Heart,
  Scale,
  Building2,
  Briefcase,
  Users
} from "lucide-react";

const TOP_MENTORS = 3; // Configurável: quantos mentores destacar

const Index = () => {
  const { mentors, loading: mentorsLoading } = useMentors();
  const navigate = useNavigate();
  const location = useLocation();

  // Faz scroll programático quando houver hash na URL (ex: /#mentores)
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const id = hash.replace('#', '');
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        // small delay to ensure any layout is ready
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 6) {
        setTimeout(tryScroll, 150);
      }
    };

    // start after a micro delay to let React render the section
    setTimeout(tryScroll, 50);
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      <Hero />

      {/* Graduations section removed per project decision */}

      {/* Featured Mentors */}
      <section id="mentores" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Mentores em Destaque</h2>
            <p className="text-sm text-muted-foreground">Mostrando os {TOP_MENTORS} melhores mentores</p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça mentores cadastrados na plataforma
            </p>
          </div>

          {mentorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {(() => {
                // Ordena por avg_rating (decrescente) e pega top 3
                // Usa utilitário para pegar os top N mentores
                const featured = getFeaturedMentors(mentors, TOP_MENTORS);

                return featured.map((m: any) => (
                  (() => {
                    // Preferir coluna subjects de mentor_profiles quando disponível
                    let subjectsFromProfile: string[] = [];
                    if (m.subjects) {
                      if (typeof m.subjects === 'string') {
                        subjectsFromProfile = m.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
                      } else if (Array.isArray(m.subjects)) {
                        subjectsFromProfile = m.subjects as string[];
                      }
                    }

                    return (
                      <MentorCard
                        key={m.id}
                        mentorId={m.user_id}
                        name={m.profiles?.full_name || 'Sem nome'}
                        course={m.profiles?.graduation || 'N/A'}
                        period={m.experience_years ? `${m.experience_years} anos exp.` : '--'}
                        subjects={subjectsFromProfile}
                        rating={m.avg_rating ?? 0}
                        reviews={m.total_ratings ?? 0}
                        location={m.location || '-'}
                        avatar={m.profiles?.avatar_url}
                      />
                    );
                  })()
                ));
              })()}
            </div>
          )}

          <div className="text-center">
            <Button variant="hero" size="lg" onClick={() => navigate('/mentors')}>
              Ver Todos os Mentores
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="sobre" className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Junte-se a centenas de alunos que já melhoraram suas notas com nossos mentores voluntários
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate("/auth")}
            >
              Cadastrar-se Grátis
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white/10"
              onClick={() => navigate('/saiba-mais')}
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-lg">UVV Mentor</h3>
            </div>
            <p className="text-muted-foreground">
              Conectando alunos aos melhores mentores da UVV para uma educação colaborativa e eficiente.
            </p>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 UVV Mentor. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;