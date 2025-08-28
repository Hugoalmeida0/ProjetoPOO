import { Button } from "@/components/ui/button";
import { GraduationCap, Search, User } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">UVV Mentor</h1>
              <p className="text-xs text-muted-foreground">Conecte</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#materias" className="text-foreground hover:text-primary transition-smooth">
              Matérias
            </a>
            <a href="#mentores" className="text-foreground hover:text-primary transition-smooth">
              Mentores
            </a>
            <a href="#sobre" className="text-foreground hover:text-primary transition-smooth">
              Sobre
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              Entrar
            </Button>
            <Button variant="hero">
              Cadastrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;