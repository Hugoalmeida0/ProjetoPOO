import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Star } from "lucide-react";

interface SubjectCardProps {
  name: string;
  description: string;
  mentors: number;
  duration: string;
  rating: number;
  color: string;
  icon: React.ReactNode;
}

const SubjectCard = ({ name, description, mentors, duration, rating, color, icon }: SubjectCardProps) => {
  return (
    <Card className="group hover:shadow-card transition-smooth hover:-translate-y-1 bg-gradient-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-smooth">
              {name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{mentors} mentores</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="default" className="w-full">
          Ver Mentores
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubjectCard;