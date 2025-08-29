import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, GraduationCap, Clock, User, MessageCircle, Calendar, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const MentorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from an API
  const mentor = {
    name: "Ana Silva",
    course: "Engenharia Civil",
    period: "8º período",
    subjects: ["Cálculo I", "Física Geral", "Resistência dos Materiais", "Desenho Técnico"],
    rating: 4.9,
    reviews: 45,
    location: "Campus Vila Velha",
    price: "R$ 35",
    avatar: undefined,
    bio: "Estudante dedicada de Engenharia Civil com paixão por ensinar. Já ajudei mais de 200 alunos a melhorarem suas notas em matérias de exatas. Metodologia focada na prática e resolução de exercícios.",
    experience: "2 anos",
    totalStudents: 85,
    responseTime: "2 horas",
    availability: ["Segunda", "Terça", "Quinta", "Sábado"],
    achievements: [
      "Top 10% da turma",
      "Monitor oficial de Cálculo I",
      "Iniciação científica em Estruturas"
    ],
    testimonials: [
      {
        student: "João Pedro",
        comment: "A Ana me ajudou muito com Cálculo I. Sua didática é excelente!",
        rating: 5,
        subject: "Cálculo I"
      },
      {
        student: "Maria Eduarda",
        comment: "Muito paciente e sempre disponível para tirar dúvidas.",
        rating: 5,
        subject: "Física Geral"
      }
    ]
  };

  const initials = mentor.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{mentor.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <GraduationCap className="h-4 w-4" />
                        <span>{mentor.course} - {mentor.period}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{mentor.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">{mentor.rating}</span>
                          <span className="text-muted-foreground">({mentor.reviews} avaliações)</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {mentor.price}<span className="text-base text-muted-foreground">/hora</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Sobre</h3>
                      <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {mentor.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Conquistas</h3>
                      <div className="space-y-2">
                        {mentor.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Avaliações dos Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentor.testimonials.map((testimonial, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="font-medium">{testimonial.student}</span>
                          <Badge variant="outline" className="text-xs">{testimonial.subject}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{testimonial.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm">Alunos atendidos</span>
                      </div>
                      <span className="font-bold">{mentor.totalStudents}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">Tempo de resposta</span>
                      </div>
                      <span className="font-bold">{mentor.responseTime}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm">Experiência</span>
                      </div>
                      <span className="font-bold">{mentor.experience}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Disponibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mentor.availability.map((day, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Mentoria
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MentorDetails;