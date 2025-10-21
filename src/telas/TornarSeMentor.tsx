import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/integrations/api/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, GraduationCap, User, MapPin, BookOpen } from "lucide-react";
import { useGraduations } from "@/hooks/useGraduations";

const BecomeMentor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: graduations = [] } = useGraduations();

  // Regra 1: Precisa estar logado para se cadastrar como mentor
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para se tornar mentor.",
        variant: "destructive",
      });
      return;
    }

    if (!subjects.trim()) {
      toast({
        title: "Erro",
        description: "Informe pelo menos uma matéria que você pode ensinar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const graduationId = formData.get("graduation") as string;
    const location = formData.get("location") as string;
    const experienceYears = parseInt(formData.get("experience") as string);
    const availability = formData.get("availability") as string;
    const bio = formData.get("bio") as string;

    try {
      // Update profile to mark as mentor
      await apiClient.profiles.update(user.id, {
        is_mentor: true,
        bio: bio
      });

      // Create mentor profile with subjects as text
      await apiClient.mentors.create({
        user_id: user.id,
        graduation_id: graduationId,
        location: location,
        experience_years: experienceYears,
        availability: availability,
        subjects: subjects.trim() // Save subjects as plain text
      });

      toast({
        title: "Sucesso!",
        description: "Seu perfil de mentor foi criado com sucesso!",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar perfil de mentor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Torne-se um Mentor</h1>
              <p className="text-muted-foreground">Compartilhe seu conhecimento e ajude outros estudantes</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Mentor</CardTitle>
            <CardDescription>
              Preencha as informações abaixo para se tornar um mentor voluntário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="graduation">Graduação</Label>
                <Select name="graduation" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua graduação" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduations.map((graduation) => (
                      <SelectItem key={graduation.id} value={graduation.id}>
                        {graduation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjects">Matérias que você pode ensinar *</Label>
                <Textarea
                  id="subjects"
                  placeholder="Ex: Cálculo I, Física Mecânica, Programação Orientada a Objetos..."
                  className="min-h-[100px]"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Digite as matérias separadas por vírgula
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Ex: Vila Velha, ES"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Anos de experiência</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Ex: 2"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilidade</Label>
                <Select name="availability" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua disponibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manhã">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                    <SelectItem value="fins-de-semana">Fins de semana</SelectItem>
                    <SelectItem value="flexível">Flexível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Conte um pouco sobre você, sua experiência e como pode ajudar outros estudantes..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando perfil..." : "Tornar-se Mentor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BecomeMentor;