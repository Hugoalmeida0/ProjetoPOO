import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Cabecalho from "@/componentes/Cabecalho";
import SubjectCard from "@/componentes/CardDisciplina";
import MentorCard from "@/componentes/CardMentor";
import { Button } from "@/componentes/ui/button";
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

  const graduationsData = {
    "engenharia-civil": {
      name: "Engenharia Civil",
      description: "Forme-se para projetar e construir infraestruturas que transformam o mundo",
      subjects: [
        {
          name: "Cálculo I",
          description: "Limites, derivadas e aplicações fundamentais",
          mentors: 8,
          duration: "1-2h",
          rating: 4.8,
          color: "bg-blue-500/10 text-blue-600",
          icon: <Calculator className="h-6 w-6" />
        },
        {
          name: "Cálculo II",
          description: "Integrais e séries matemáticas",
          mentors: 7,
          duration: "1-2h",
          rating: 4.7,
          color: "bg-blue-600/10 text-blue-700",
          icon: <Calculator className="h-6 w-6" />
        },
        {
          name: "Física Geral",
          description: "Mecânica, termodinâmica e ondas",
          mentors: 6,
          duration: "1-2h",
          rating: 4.7,
          color: "bg-purple-500/10 text-purple-600",
          icon: <Atom className="h-6 w-6" />
        },
        {
          name: "Resistência dos Materiais",
          description: "Análise de tensões e deformações",
          mentors: 5,
          duration: "2-3h",
          rating: 4.6,
          color: "bg-orange-500/10 text-orange-600",
          icon: <Building className="h-6 w-6" />
        },
        {
          name: "Desenho Técnico",
          description: "CAD, AutoCAD e projetos técnicos",
          mentors: 4,
          duration: "2-3h",
          rating: 4.5,
          color: "bg-green-500/10 text-green-600",
          icon: <PenTool className="h-6 w-6" />
        },
        {
          name: "Mecânica dos Solos",
          description: "Análise e comportamento do solo",
          mentors: 6,
          duration: "2-3h",
          rating: 4.4,
          color: "bg-yellow-500/10 text-yellow-600",
          icon: <Wrench className="h-6 w-6" />
        },
        {
          name: "Estruturas de Concreto",
          description: "Projeto e dimensionamento em concreto armado",
          mentors: 5,
          duration: "2-3h",
          rating: 4.6,
          color: "bg-gray-500/10 text-gray-600",
          icon: <Building className="h-6 w-6" />
        },
        {
          name: "Hidráulica",
          description: "Sistemas hidráulicos e saneamento",
          mentors: 4,
          duration: "2h",
          rating: 4.3,
          color: "bg-cyan-500/10 text-cyan-600",
          icon: <Globe className="h-6 w-6" />
        }
      ],
      mentors: [
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
          name: "Carlos Mendes",
          course: "Engenharia Civil",
          period: "9º período",
          subjects: ["Estruturas", "Concreto", "Fundações"],
          rating: 4.8,
          reviews: 32,
          location: "Campus Vila Velha",
          price: "R$ 40"
        }
      ]
    },
    "ciencia-computacao": {
      name: "Ciência da Computação",
      description: "Desenvolva soluções tecnológicas inovadoras para o futuro digital",
      subjects: [
        {
          name: "Programação I",
          description: "Lógica de programação e algoritmos",
          mentors: 12,
          duration: "1-2h",
          rating: 4.9,
          color: "bg-green-500/10 text-green-600",
          icon: <Laptop className="h-6 w-6" />
        },
        {
          name: "Programação II",
          description: "Programação orientada a objetos",
          mentors: 10,
          duration: "2-3h",
          rating: 4.8,
          color: "bg-green-600/10 text-green-700",
          icon: <Laptop className="h-6 w-6" />
        },
        {
          name: "Estrutura de Dados",
          description: "Listas, pilhas, filas e árvores",
          mentors: 8,
          duration: "2-3h",
          rating: 4.7,
          color: "bg-blue-500/10 text-blue-600",
          icon: <TrendingUp className="h-6 w-6" />
        },
        {
          name: "Algoritmos e Complexidade",
          description: "Análise de algoritmos e teoria da computação",
          mentors: 6,
          duration: "2-3h",
          rating: 4.6,
          color: "bg-indigo-500/10 text-indigo-600",
          icon: <Calculator className="h-6 w-6" />
        },
        {
          name: "Banco de Dados",
          description: "SQL, NoSQL e modelagem de dados",
          mentors: 6,
          duration: "1-2h",
          rating: 4.8,
          color: "bg-purple-500/10 text-purple-600",
          icon: <Building className="h-6 w-6" />
        },
        {
          name: "Redes de Computadores",
          description: "Protocolos, TCP/IP e arquiteturas",
          mentors: 4,
          duration: "2h",
          rating: 4.6,
          color: "bg-orange-500/10 text-orange-600",
          icon: <Globe className="h-6 w-6" />
        },
        {
          name: "Engenharia de Software",
          description: "Metodologias ágeis e padrões de projeto",
          mentors: 7,
          duration: "2-3h",
          rating: 4.5,
          color: "bg-pink-500/10 text-pink-600",
          icon: <Wrench className="h-6 w-6" />
        },
        {
          name: "Inteligência Artificial",
          description: "Machine Learning e redes neurais",
          mentors: 5,
          duration: "2-3h",
          rating: 4.7,
          color: "bg-violet-500/10 text-violet-600",
          icon: <Zap className="h-6 w-6" />
        }
      ],
      mentors: [
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
          name: "Lucas Costa",
          course: "Ciência da Computação",
          period: "7º período",
          subjects: ["React", "Node.js", "Banco de Dados"],
          rating: 4.9,
          reviews: 28,
          location: "Campus Vila Velha",
          price: "R$ 45"
        }
      ]
    },
    "engenharia-eletrica": {
      name: "Engenharia Elétrica",
      description: "Domine a energia que move o mundo moderno",
      subjects: [
        {
          name: "Circuitos Elétricos I",
          description: "Análise de circuitos DC e AC",
          mentors: 6,
          duration: "2-3h",
          rating: 4.8,
          color: "bg-yellow-500/10 text-yellow-600",
          icon: <Zap className="h-6 w-6" />
        },
        {
          name: "Circuitos Elétricos II",
          description: "Análise avançada de circuitos",
          mentors: 5,
          duration: "2-3h",
          rating: 4.7,
          color: "bg-yellow-600/10 text-yellow-700",
          icon: <Zap className="h-6 w-6" />
        },
        {
          name: "Física Geral",
          description: "Eletromagnetismo e física moderna",
          mentors: 5,
          duration: "1-2h",
          rating: 4.7,
          color: "bg-purple-500/10 text-purple-600",
          icon: <Atom className="h-6 w-6" />
        },
        {
          name: "Sistemas de Controle",
          description: "Controle automático e robótica",
          mentors: 4,
          duration: "2-3h",
          rating: 4.6,
          color: "bg-blue-500/10 text-blue-600",
          icon: <Wrench className="h-6 w-6" />
        },
        {
          name: "Eletrônica Analógica",
          description: "Amplificadores e filtros",
          mentors: 3,
          duration: "2h",
          rating: 4.5,
          color: "bg-green-500/10 text-green-600",
          icon: <Calculator className="h-6 w-6" />
        },
        {
          name: "Eletrônica Digital",
          description: "Sistemas digitais e microcontroladores",
          mentors: 4,
          duration: "2-3h",
          rating: 4.6,
          color: "bg-red-500/10 text-red-600",
          icon: <Laptop className="h-6 w-6" />
        },
        {
          name: "Máquinas Elétricas",
          description: "Motores e geradores elétricos",
          mentors: 3,
          duration: "2-3h",
          rating: 4.4,
          color: "bg-indigo-500/10 text-indigo-600",
          icon: <Wrench className="h-6 w-6" />
        },
        {
          name: "Sistemas de Potência",
          description: "Geração e distribuição de energia",
          mentors: 2,
          duration: "2-3h",
          rating: 4.3,
          color: "bg-orange-500/10 text-orange-600",
          icon: <Building className="h-6 w-6" />
        }
      ],
      mentors: [
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
      ]
    }
  };

  const graduation = graduationsData[slug as keyof typeof graduationsData];

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {graduation.subjects.map((subject, index) => (
              <SubjectCard key={index} {...subject} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Mentores em Destaque</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mentores especializados em {graduation.name}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {graduation.mentors.map((mentor, index) => (
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