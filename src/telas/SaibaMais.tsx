import Cabecalho from "@/componentes/Cabecalho";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent } from "@/componentes/ui/card";
import { ArrowRight, CalendarCheck, MessageSquareHeart, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SaibaMais = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />

      {/* Hero */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">Como a mentoria transforma seus estudos</h1>
          <p className="text-white/90 text-lg max-w-3xl mx-auto mb-8">
            Um espaço acolhedor e gratuito para tirar dúvidas, organizar sua rotina e aprender com quem já passou pelos mesmos desafios.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="bg-white text-primary hover:bg-white/90" size="lg" onClick={() => navigate('/mentors')}>
              Encontrar Mentores
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              Começar Agora
            </Button>
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-muted/40">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Aprendizado simples</h3>
                <p className="text-muted-foreground">Explicações diretas, materiais compartilhados e dicas práticas para a prova.</p>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Mentoria 1:1 ou em grupo</h3>
                <p className="text-muted-foreground">Converse com um mentor ou junte-se a colegas para evoluir junto.</p>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
                  <MessageSquareHeart className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ambiente acolhedor</h3>
                <p className="text-muted-foreground">Mentores voluntários, acessíveis e comprometidos com seu progresso.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-4 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-1 h-6 w-6 rounded-full bg-primary/10 text-primary grid place-items-center">1</span> Crie sua conta em poucos cliques e informe as matérias que precisa de ajuda.</li>
                <li className="flex gap-3"><span className="mt-1 h-6 w-6 rounded-full bg-primary/10 text-primary grid place-items-center">2</span> Encontre mentores com experiência na disciplina e veja avaliações de alunos.</li>
                <li className="flex gap-3"><span className="mt-1 h-6 w-6 rounded-full bg-primary/10 text-primary grid place-items-center">3</span> Agende um horário, envie suas dúvidas e receba materiais de apoio.</li>
                <li className="flex gap-3"><span className="mt-1 h-6 w-6 rounded-full bg-primary/10 text-primary grid place-items-center">4</span> Acompanhe sua evolução e volte quando precisar — a comunidade te apoia.</li>
              </ul>

              <div className="mt-8 flex gap-3">
                <Button onClick={() => navigate('/mentors')}>
                  Ver mentores
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => navigate('/meus-agendamentos')}>
                  Meus agendamentos
                  <CalendarCheck className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent grid place-items-center">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-3">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">UVV Mentor</span>
                  </div>
                  <p className="text-lg font-medium">Da dúvida ao domínio: dê o próximo passo hoje.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer curto */}
      <footer className="py-10 bg-card border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 UVV Mentor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default SaibaMais;
