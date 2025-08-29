import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap } from "lucide-react";
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

const GraduationCard = ({ 
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
    <Card className="group hover:shadow-card transition-smooth hover:-translate-y-1 bg-gradient-card border-0 cursor-pointer" onClick={handleClick}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-smooth">
              {name}
            </CardTitle>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col items-center text-center">
            <Users className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="font-semibold">{students}</span>
            <span className="text-xs text-muted-foreground">Alunos</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="font-semibold">{subjects}</span>
            <span className="text-xs text-muted-foreground">Matérias</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <GraduationCap className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="font-semibold">{mentors}</span>
            <span className="text-xs text-muted-foreground">Mentores</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="default" className="w-full">
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GraduationCard;