import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Textarea } from "@/componentes/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/componentes/ui/select";
import { Badge } from "@/componentes/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/componentes/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/componentes/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api";
import { useAuth } from "@/hooks/useAutenticacao";
import { ArrowLeft, GraduationCap, User, MapPin, BookOpen, X, Check } from "lucide-react";
import { useGraduations } from "@/hooks/useGraduacoes";
import useMentors from "@/hooks/useMentores";
import Cabecalho from "@/componentes/Cabecalho";
import { normalizeSubject, uniqueSubjects } from "@/lib/normalizeSubject";
import { cn } from "@/lib/utils";

const BecomeMentor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: graduations = [] } = useGraduations();
  const { mentors } = useMentors();

  // Extrai e normaliza todas as especialidades existentes dos mentores
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (mentors.length > 0) {
      const allSubjects: string[] = [];
      mentors.forEach((mentor: any) => {
        if (mentor.subjects) {
          const subjectsArray = typeof mentor.subjects === 'string'
            ? mentor.subjects.split(',').map(s => s.trim())
            : mentor.subjects;
          allSubjects.push(...subjectsArray);
        }
      });
      setAvailableSubjects(uniqueSubjects(allSubjects));
    }
  }, [mentors]);

  // Regra 1: Precisa estar logado para se cadastrar como mentor
  if (!user) {
    navigate('/auth');
    return null;
  }

  const addSubject = (subject: string) => {
    const normalized = normalizeSubject(subject);
    if (normalized && !selectedSubjects.some(s => normalizeSubject(s) === normalized)) {
      setSelectedSubjects([...selectedSubjects, normalized]);
      setSubjectInput("");
      setOpen(false);
    }
  };

  const removeSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
  };

  const filteredSubjects = availableSubjects.filter(subject =>
    normalizeSubject(subject).toLowerCase().includes(normalizeSubject(subjectInput).toLowerCase())
  );

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

    if (selectedSubjects.length === 0) {
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

      // Create mentor profile with normalized subjects as text
      await apiClient.mentors.create({
        user_id: user.id,
        graduation_id: graduationId,
        location: location,
        experience_years: experienceYears,
        availability: availability,
        subjects: selectedSubjects.join(', ') // Save normalized subjects
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
    <div className="min-h-screen bg-background">
      <Cabecalho />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
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
                <Label htmlFor="subjects">Especialidades que você pode ensinar *</Label>
                <div className="space-y-2">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        Adicionar especialidade...
                        <Check className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar ou digitar nova especialidade..."
                          value={subjectInput}
                          onValueChange={setSubjectInput}
                        />
                        <CommandEmpty>
                          <div className="p-4 text-sm text-center">
                            <p className="mb-2">Nenhuma especialidade encontrada.</p>
                            {subjectInput && (
                              <Button
                                size="sm"
                                onClick={() => addSubject(subjectInput)}
                              >
                                Adicionar "{normalizeSubject(subjectInput)}"
                              </Button>
                            )}
                          </div>
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {filteredSubjects.map((subject) => (
                            <CommandItem
                              key={subject}
                              value={subject}
                              onSelect={() => addSubject(subject)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedSubjects.some(s => normalizeSubject(s) === normalizeSubject(subject))
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {subject}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
                      {selectedSubjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="pl-3 pr-1">
                          {subject}
                          <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {selectedSubjects.length} selecionadas. Clique no botão acima para adicionar especialidades.
                  </p>
                </div>
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