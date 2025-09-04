import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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

  // Mock mentor data - in a real app, this would come from an API based on the ID
  const mentor = {
    name: "Ana Silva",
    course: "Engenharia Civil",
    period: "8º período",
    subjects: ["Cálculo I", "Física Geral", "Resistência dos Materiais", "Desenho Técnico"],
    rating: 4.9,
    price: "R$ 35",
    avatar: undefined,
  };

  const initials = mentor.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const durations = [
    { value: "60", label: "1 hora" },
    { value: "90", label: "1h 30min" },
    { value: "120", label: "2 horas" },
  ];

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      studentName: "",
      studentEmail: "",
      studentPhone: "",
      objective: "",
    },
  });

  const onSubmit = (data: BookingFormData) => {
    // In a real app, this would make an API call
    console.log("Booking data:", data);
    
    toast({
      title: "Mentoria agendada com sucesso!",
      description: `Sua mentoria com ${mentor.name} foi agendada para ${format(data.date, "dd/MM/yyyy", { locale: ptBR })} às ${data.time}.`,
    });

    // Navigate back or to a confirmation page
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{mentor.name}</h3>
                      <p className="text-sm text-muted-foreground">{mentor.course}</p>
                      <p className="text-sm text-muted-foreground">{mentor.period}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="text-2xl font-bold text-primary">
                        {mentor.price}<span className="text-base text-muted-foreground">/hora</span>
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
                                    onSelect={field.onChange}
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
                                    <SelectValue placeholder="Selecionar horário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
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
                                    <SelectValue placeholder="Selecionar matéria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mentor.subjects.map((subject) => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
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
                        <Button type="submit" className="w-full" size="lg">
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
};

export default BookingMentorship;