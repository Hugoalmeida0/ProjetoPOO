import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Users, BookOpen, GraduationCap, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GraduationCardProps {
  name: string;
  description: string;
  students: number;
  subjects: number;
  mentors: number;
  color: string;
  icon: React.ReactNode;
  slug: string;
}

const CardGraduacao = ({
  name,
  description,
  students,
  subjects,
  mentors,
  color,
  icon,
  slug
}: GraduationCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/graduacao/${slug}`);
  };

  return (
    <Card className="group hover:shadow-pink transition-glow hover:-translate-y-2 bg-gradient-card border-0 cursor-pointer relative overflow-hidden" onClick={handleClick}>
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-100 transition-glow -z-10 blur-xl"></div>
      <div className="absolute inset-[1px] bg-card rounded-lg"></div>

      <CardHeader className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-bounce shadow-soft`}>
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold group-hover:text-primary transition-smooth mb-2 group-hover:bg-gradient-primary group-hover:bg-clip-text group-hover:text-transparent">
              {name}
            </CardTitle>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-3 rounded-lg bg-muted/30 group-hover:bg-primary/5 transition-smooth">
            <div className="flex flex-col items-center">
              <Users className="h-5 w-5 text-primary mb-2" />
              <span className="text-2xl font-bold text-primary mb-1">{students}</span>
              <span className="text-sm text-muted-foreground font-medium">Alunos</span>
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30 group-hover:bg-primary/5 transition-smooth">
            <div className="flex flex-col items-center">
              <BookOpen className="h-5 w-5 text-primary mb-2" />
              <span className="text-2xl font-bold text-primary mb-1">{subjects}</span>
              <span className="text-sm text-muted-foreground font-medium">Matérias</span>
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30 group-hover:bg-primary/5 transition-smooth">
            <div className="flex flex-col items-center">
              <GraduationCap className="h-5 w-5 text-primary mb-2" />
              <span className="text-2xl font-bold text-primary mb-1">{mentors}</span>
              <span className="text-sm text-muted-foreground font-medium">Mentores</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Explorar curso</span>
          <ArrowUpRight className="h-5 w-5 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-smooth" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CardGraduacao;