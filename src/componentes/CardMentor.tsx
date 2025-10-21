import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/componentes/ui/avatar";
import { Star, MapPin, GraduationCap } from "lucide-react";

interface MentorCardProps {
  mentorId: string;
  name: string;
  course: string;
  period: string;
  subjects: string[];
  rating: number;
  reviews: number;
  location: string;
  avatar?: string;
}

const CardMentor = ({
  mentorId,
  name,
  course,
  period,
  subjects,
  rating,
  reviews,
  location,
  avatar
}: MentorCardProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="group hover:shadow-card transition-smooth hover:-translate-y-1 bg-gradient-card border-0">
      <CardHeader className="text-center">
        <Avatar className="h-20 w-20 mx-auto mb-3 ring-2 ring-primary/20">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-lg font-semibold bg-gradient-primary text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-smooth">
            {name}
          </h3>
          <div className="flex items-center gap-1 justify-center text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{course} - {period}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 mt-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const currentRating = typeof rating === 'number' ? rating : 0;
              const isFilled = star <= currentRating;
              const isHalfFilled = star - 0.5 <= currentRating && star > currentRating;

              return (
                <div key={star} className="relative">
                  <Star className="h-4 w-4 text-gray-300" />
                  {(isFilled || isHalfFilled) && (
                    <Star
                      className={`h-4 w-4 absolute top-0 left-0 fill-yellow-400 text-yellow-400 ${isHalfFilled ? 'clip-path-half' : ''
                        }`}
                      style={isHalfFilled ? {
                        clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                      } : undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <span className="font-medium ml-1">{typeof rating === 'number' ? rating.toFixed(1) : '0.0'}</span>
          <span className="text-muted-foreground text-sm">({reviews || 0} avaliações)</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Especialidades:</p>
          <div className="flex flex-wrap gap-1">
            {subjects.map((subject, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-center">
          <span className="text-sm font-medium text-primary">Mentoria Voluntária</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => (window.location.href = `/mentor/${mentorId}`)}
        >
          Ver Perfil
        </Button>
        <Button variant="hero" className="flex-1" onClick={() => (window.location.href = `/agendar/${mentorId}`)}>
          Agendar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardMentor;