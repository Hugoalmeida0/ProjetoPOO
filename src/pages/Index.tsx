import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SubjectCard from "@/components/SubjectCard";
import MentorCard from "@/components/MentorCard";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Atom, 
  Laptop, 
  PenTool, 
  Globe, 
  TrendingUp,
  ArrowRight 
} from "lucide-react";

const Index = () => {
  const subjects = [
    {
      name: "Cálculo I",
      description: "Limites, derivadas e aplicações fundamentais",
      mentors: 25,
      duration: "1-2h",
      rating: 4.8,
      color: "bg-blue-500/10 text-blue-600",
      icon: <Calculator className="h-6 w-6" />
    },
    {
      name: "Física Geral",
      description: "Mecânica, termodinâmica e ondas",
      mentors: 18,
      duration: "1-2h",
      rating: 4.7,
      color: "bg-purple-500/10 text-purple-600",
      icon: <Atom className="h-6 w-6" />
    },
    {
      name: "Programação",
      description: "Python, Java, C++ e desenvolvimento web",
      mentors: 32,
      duration: "1-3h",
      rating: 4.9,
      color: "bg-green-500/10 text-green-600",
      icon: <Laptop className="h-6 w-6" />
    },
    {
      name: "Desenho Técnico",
      description: "CAD, AutoCAD e projetos técnicos",
      mentors: 12,
      duration: "2-3h",
      rating: 4.6,
      color: "bg-orange-500/10 text-orange-600",
      icon: <PenTool className="h-6 w-6" />
    },
    {
      name: "Inglês Técnico",
      description: "Inglês para engenharia e negócios",
      mentors: 15,
      duration: "1h",
      rating: 4.5,
      color: "bg-red-500/10 text-red-600",
      icon: <Globe className="h-6 w-6" />
    },
    {
      name: "Estatística",
      description: "Análise de dados e probabilidade",
      mentors: 20,
      duration: "1-2h",
      rating: 4.7,
      color: "bg-indigo-500/10 text-indigo-600",
      icon: <TrendingUp className="h-6 w-6" />
    }
  ];

  const mentors = [
    {
      name: "Ana Silva",
      course: "Engenharia Civil",
      period: "8º período",
      subjects: ["Cálculo I", "Física", "Resistência"],
      rating: 4.9,
      reviews: 45,
      location: "Campus Vila Velha",
      price: "R$ 35"
    },
    {
      name: "Pedro Santos",
      course: "Ciência da Computação",
      period: "6º período",
      subjects: ["Python", "Java", "Estruturas"],
      rating: 4.8,
      reviews: 38,
      location: "Online",
      price: "R$ 40"
    },
    {
      name: "Maria Costa",
      course: "Engenharia Elétrica",
      period: "9º período",
      subjects: ["Física", "Circuitos", "Controle"],
      rating: 4.9,
      reviews: 52,
      location: "Campus Vila Velha",
      price: "R$ 45"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Subjects Section */}
      <section id="materias" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Matérias Disponíveis</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encontre mentores especializados nas disciplinas que você precisa dominar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {subjects.map((subject, index) => (
              <SubjectCard key={index} {...subject} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg">
              Ver Todas as Matérias
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section id="mentores" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Mentores em Destaque</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça alguns dos nossos melhores mentores avaliados pelos alunos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mentors.map((mentor, index) => (
              <MentorCard key={index} {...mentor} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="hero" size="lg">
              Ver Todos os Mentores
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Junte-se a centenas de alunos que já melhoraram suas notas com nossos mentores
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
              Cadastrar-se Grátis
            </Button>
            <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">UVV Mentor</h3>
              </div>
              <p className="text-muted-foreground">
                Conectando alunos aos melhores mentores da UVV para uma educação colaborativa e eficiente.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Como Funciona</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Para Mentores</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 UVV Mentor. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;