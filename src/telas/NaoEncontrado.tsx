import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cabecalho from "@/componentes/Cabecalho";
import { Button } from "@/componentes/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
          <p className="text-2xl text-muted-foreground mb-2">Página não encontrada</p>
          <p className="text-muted-foreground mb-8">A página que você está procurando não existe.</p>
          <Button onClick={() => navigate("/")} size="lg">
            <Home className="mr-2 h-4 w-4" />
            Voltar para Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
