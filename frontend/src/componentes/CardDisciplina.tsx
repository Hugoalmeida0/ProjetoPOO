import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Users, Clock, Star } from "lucide-react";

interface SubjectCardProps {
  name: string;
  description?: string;
  mentors?: number;
  duration?: string;
  rating?: number;
  color?: string;
  icon?: React.ReactNode;
}

const CardDisciplina = ({ name, description, mentors, duration, rating, color, icon }: SubjectCardProps) => {
  const safeRating = Number.isFinite(rating as number) ? (rating as number) : 0;
  const safeMentors = typeof mentors === 'number' && Number.isFinite(mentors) ? mentors : 0;
  const safeDuration = typeof duration === 'string' && duration.trim().length > 0 ? duration : '—';
  const safeDescription = description ?? '';
  const colorClass = color ?? 'bg-primary/10 text-primary';
  const iconNode = icon ?? <Star className="h-6 w-6" />;
  return (
    <Card className="group hover:shadow-card transition-smooth hover:-translate-y-1 bg-gradient-card border-0 cursor-pointer">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            {iconNode}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-smooth">
              {name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">{safeRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        {safeDescription && (
          <p className="text-muted-foreground text-sm">{safeDescription}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{safeMentors} mentores</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{safeDuration}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="default"
          className="w-full"
          onClick={() => window.location.href = `/mentor/1`}
        >
          Ver Mentores
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardDisciplina;