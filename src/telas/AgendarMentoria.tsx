import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import Cabecalho from "@/componentes/Cabecalho";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Textarea } from "@/componentes/ui/textarea";
import { Calendar as CalendarComponent } from "@/componentes/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/componentes/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/componentes/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/componentes/ui/form";
import { Badge } from "@/componentes/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/componentes/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAutenticacao";
import { useBookings } from "@/hooks/useAgendamentos";
import { apiClient } from "@/integracoes/api/client";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  date: z.date({
    required_error: "Selecione uma data para a mentoria",
  }),
  time: z.string().min(1, "Selecione um horário"),
  duration: z.string().min(1, "Selecione a duração"),
  subject: z.string().min(1, "Selecione uma matéria"),
  objective: z.string().min(10, "Descreva o objetivo da mentoria (mínimo 10 caracteres)"),
  studentName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  studentEmail: z.string().email("Email inválido"),
  studentPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingMentorship = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isTimeSlotOccupied, createBooking, fetchMentorBookings } = useBookings();
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentor, setMentor] = useState<any>(null);
  const [loadingMentor, setLoadingMentor] = useState(true);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);


  // Carregar dados reais do mentor
  useEffect(() => {
    const loadMentor = async () => {
      if (!id) return;
      try {
        setLoadingMentor(true);
        const [mentorData, profileData] = await Promise.all([
          apiClient.mentors.getByUserId(id).catch(() => null),
          apiClient.profiles.getByUserId(id).catch(() => null),
        ]);
        if (!mentorData || !profileData) {
          throw new Error('Mentor não encontrado');
        }
        const merged = { ...mentorData, profiles: profileData };
        setMentor(merged);

        // Processar matérias do campo subjects (texto livre separado por vírgula)
        try {
          if (mentorData.subjects && typeof mentorData.subjects === 'string') {
            const subjectsArray = mentorData.subjects
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
              .map((name: string, idx: number) => ({ id: `subject-${idx}`, name }));
            setSubjectsList(subjectsArray);
          } else {
            setSubjectsList([]);
          }
        } catch (err) {
          console.error('Erro ao processar matérias do mentor:', err);
          setSubjectsList([]);
        }
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao carregar dados do mentor',
          variant: 'destructive',
        });
        navigate(-1);
      } finally {
        setLoadingMentor(false);
      }
    };
    loadMentor();
  }, [id, toast, navigate]);


  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return; // aguarda finalizar carregamento do usuário
    if (!user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para agendar uma mentoria.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [authLoading, user, navigate, toast]);

  // Carregar horários ocupados quando a data for selecionada
  useEffect(() => {
    const loadOccupiedSlots = async () => {
      if (selectedDate && id) {
        try {
          setIsLoadingSlots(true);
          const dateString = selectedDate.toISOString().split('T')[0];
          console.log("Carregando horários para data:", dateString);
          console.log("ID do mentor:", id, "Tipo:", typeof id);

          const mentorBookings = await fetchMentorBookings(id);
          console.log("Agendamentos do mentor:", mentorBookings); const occupied = new Set(
            mentorBookings
              .filter(booking => booking.date === dateString)
              .map(booking => booking.time)
          );

          console.log("Horários ocupados:", Array.from(occupied));
          setOccupiedSlots(occupied);
        } catch (error) {
          console.error("Erro ao carregar horários ocupados:", error);
          setOccupiedSlots(new Set()); // Reset em caso de erro
        } finally {
          setIsLoadingSlots(false);
        }
      } else {
        setOccupiedSlots(new Set()); // Reset quando não há data selecionada
      }
    };

    // Debounce para evitar muitas requisições
    const timeoutId = setTimeout(loadOccupiedSlots, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedDate, id]);

  // Mapear disponibilidade do mentor para horários
  const timeSlots = useMemo(() => {
    if (!mentor?.availability) return [];
    const avail = String(mentor.availability).toLowerCase();
    if (avail.includes('manhã') || avail.includes('flexível')) return ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    if (avail.includes('tarde')) return ["14:00", "15:00", "16:00", "17:00"];
    if (avail.includes('noite')) return ["18:00", "19:00", "20:00"];
    return ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  }, [mentor]);


  const durations = [
    { value: "60", label: "1 hora" },
    { value: "90", label: "1h 30min" },
    { value: "120", label: "2 horas" },
  ];

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      studentName: (user as any)?.full_name || "",
      studentEmail: user?.email || "",
      studentPhone: "",
      objective: "",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!user || !id || !mentor) return;

    setIsSubmitting(true); // Inicia o loading

    try {
      const dateString = data.date.toISOString().split('T')[0];

      // Garantir que o horário escolhido não está ocupado
      if (occupiedSlots.has(data.time)) {
        throw new Error('Este horário já está ocupado. Por favor, escolha outro.');
      }

      // Passo 1: Para matérias em texto livre, usar diretamente o nome como subject_name
      // Não precisa buscar no banco, pois o campo subjects no mentor é texto livre
      const subjectName = data.subject;

      // Passo 2: Montar o objeto final do agendamento
      const bookingData = {
        student_id: user.id,
        mentor_id: id,
        subject_name: subjectName, // Usar subject_name ao invés de subject_id
        date: dateString,
        time: data.time,
        duration: parseInt(data.duration),
        objective: data.objective,
        student_name: data.studentName,
        student_email: data.studentEmail,
        student_phone: data.studentPhone,
        status: 'pending' as const
      };

      // Passo 3: Chamar a função do seu hook para criar o agendamento
      await createBooking(bookingData);

      // Se tudo deu certo até aqui:
      toast({
        title: "Mentoria agendada com sucesso!",
        description: `Sua mentoria com ${mentor.profiles?.full_name || 'o mentor'} foi agendada para ${format(data.date, "dd/MM/yyyy", { locale: ptBR })} às ${data.time}.`,
      });

      navigate(-1); // Navega para a página anterior

    } catch (error) {
      // QUALQUER ERRO nos passos acima será capturado aqui, IMPEDINDO A TELA BRANCA
      console.error("Falha na submissão do agendamento:", error);
      toast({
        title: "Erro ao agendar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });

    } finally {
      // Este bloco é executado sempre, seja em caso de sucesso ou erro
      setIsSubmitting(false); // Finaliza o loading
    }
  };

  // Error boundary para capturar erros
  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">ID do mentor não encontrado</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (loadingMentor || !mentor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando dados do mentor...</p>
        </div>
      </div>
    );
  }

  const initials = (mentor.profiles?.full_name || 'M').split(' ').map((n: string) => n[0]).join('').toUpperCase();

  try {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />

        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Mentor Info Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-gradient-card border-0 shadow-card sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Mentor Selecionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                        <AvatarImage src={mentor.profiles?.avatar_url} alt={mentor.profiles?.full_name} />
                        <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{mentor.profiles?.full_name || 'Mentor'}</h3>
                        <p className="text-sm text-muted-foreground">{mentor.profiles?.graduation || 'Graduação'}</p>
                        <p className="text-sm text-muted-foreground">{mentor.experience_years ? `${mentor.experience_years} anos exp.` : '--'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Disponibilidade:</p>
                        <Badge variant="secondary">{mentor.availability || 'Flexível'}</Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Localização:</p>
                        <p className="text-sm text-muted-foreground">{mentor.location || '--'}</p>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="px-3 py-2 bg-gradient-primary text-white rounded-lg text-center">
                          <span className="text-sm font-medium">R$ {typeof mentor.price_per_hour === 'number' ? mentor.price_per_hour.toFixed(2) : '0.00'}/hora</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                <Card className="bg-gradient-card border-0 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Agendar Mentoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Date and Time Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Data da Mentoria</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                        ) : (
                                          <span>Selecionar data</span>
                                        )}
                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setSelectedDate(date);
                                      }}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                      className="p-3 pointer-events-auto"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={
                                        timeSlots.length === 0
                                          ? 'Mentor sem disponibilidade definida'
                                          : (isLoadingSlots ? 'Carregando horários...' : 'Selecionar horário')
                                      } />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeSlots.length === 0 ? (
                                      <SelectGroup>
                                        <SelectLabel>Mentor sem disponibilidade definida</SelectLabel>
                                      </SelectGroup>
                                    ) : isLoadingSlots ? (
                                      <SelectGroup>
                                        <SelectLabel>Carregando horários...</SelectLabel>
                                      </SelectGroup>
                                    ) : (
                                      timeSlots.map((time) => {
                                        const isOccupied = occupiedSlots.has(time);
                                        return (
                                          <SelectItem
                                            key={time}
                                            value={time}
                                            disabled={isOccupied}
                                            className={isOccupied ? "text-muted-foreground opacity-50" : ""}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <span className={isOccupied ? "text-muted-foreground" : ""}>
                                                {time}
                                              </span>
                                              {isOccupied && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                  (Ocupado)
                                                </span>
                                              )}
                                            </div>
                                          </SelectItem>
                                        );
                                      })
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Duration and Subject */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duração</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecionar duração" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {durations.map((duration) => (
                                      <SelectItem key={duration.value} value={duration.value}>
                                        {duration.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Matéria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={subjectsList.length ? 'Selecionar matéria' : 'Carregando matérias...'} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subjectsList.length ? (
                                      subjectsList.map((s: any) => (
                                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                      ))
                                    ) : (
                                      <SelectGroup>
                                        <SelectLabel>Nenhuma matéria disponível</SelectLabel>
                                      </SelectGroup>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Objective */}
                        <FormField
                          control={form.control}
                          name="objective"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Objetivo da Mentoria</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva o que você gostaria de aprender ou as dúvidas que tem sobre a matéria..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Student Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Suas Informações
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="studentName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome Completo</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Seu nome completo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="studentEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="seu.email@uvv.br" type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="studentPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone/WhatsApp</FormLabel>
                                <FormControl>
                                  <Input placeholder="(27) 99999-9999" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                          <Button type="submit" className="w-full" size="lg" disabled={!timeSlots.length || isSubmitting || isLoadingSlots}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Confirmar Agendamento
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Erro no componente BookingMentorship:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">Ocorreu um erro inesperado. Tente recarregar a página.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }
};

export default BookingMentorship;