import { Button } from "@/componentes/ui/button";
import { ArrowRight, Users, BookOpen, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";

const Heroi = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Conecte-se aos
            <span className="block bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
              Melhores Mentores
            </span>
            da UVV
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Encontre mentores qualificados, agende monitorias e melhore seu desempenho acadêmico
            de forma personalizada e eficiente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Encontrar Mentor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20">
              Ser Mentor
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white/20 rounded-full mb-3">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">150+</div>
              <div className="text-white/80">Mentores Ativos</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white/20 rounded-full mb-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">50+</div>
              <div className="text-white/80">Disciplinas</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white/20 rounded-full mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-white/80">Sessões Realizadas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Heroi;