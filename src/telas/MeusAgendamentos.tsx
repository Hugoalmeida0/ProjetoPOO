import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Cabecalho from "@/componentes/Cabecalho";
import { ChatDialog as DialogoChat } from "@/componentes/DialogoChat";
import { CancelBookingDialog as DialogoCancelarAgendamento } from "@/componentes/DialogoCancelarAgendamento";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/componentes/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAutenticacao";
import { useBookings, Booking } from "@/hooks/useAgendamentos";
import { cn } from "@/lib/utils";

const MyBookings = () => {
    const navigate = useNavigate();
    const location = useLocation() as any;
    const { toast } = useToast();
    const { user } = useAuth();
    const { bookings, loading, cancelBooking, completeBooking } = useBookings();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const getStatusBadge = (status: Booking['status']) => {
        const statusConfig = {
            pending: { label: "Pendente", variant: "secondary" as const, icon: AlertCircle },
            confirmed: { label: "Confirmado", variant: "default" as const, icon: CheckCircle },
            cancelled: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
            completed: { label: "Finalizado", variant: "outline" as const, icon: CheckCircle },
        };

        const config = statusConfig[status];
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const handleCancelBooking = async (bookingId: string, cancelMessage: string) => {
        setActionLoading(bookingId);
        try {
            await cancelBooking(bookingId, cancelMessage);
            toast({
                title: "Agendamento cancelado",
                description: "Seu agendamento foi cancelado e uma notificação foi enviada.",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao cancelar agendamento. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleCompleteBooking = async (bookingId: string) => {
        setActionLoading(bookingId);
        try {
            await completeBooking(bookingId);
            toast({
                title: "Mentoria finalizada",
                description: "Sua mentoria foi marcada como finalizada.",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao finalizar mentoria. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const canCancel = (booking: Booking) => {
        const bookingDate = getBookingDate(booking);
        if (!bookingDate) return false;
        const now = new Date();
        // Mostrar o botão de cancelamento enquanto a mentoria ainda não começou
        // para status 'pending' ou 'confirmed'.
        return ['pending', 'confirmed'].includes(booking.status) && bookingDate.getTime() > now.getTime();
    };

    const canComplete = (booking: Booking) => {
        const bookingDate = getBookingDate(booking);
        if (!bookingDate) return false;
        const now = new Date();
        const hoursAfterBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);

        return booking.status === 'confirmed' && hoursAfterBooking >= 0;
    };

    const getCancelDisabledReason = (booking: Booking): string | null => {
        const bookingDate = getBookingDate(booking);
        const now = new Date();
        if (booking.status === 'cancelled') return 'Este agendamento já foi cancelado.';
        if (booking.status === 'completed') return 'Mentoria finalizada não pode ser cancelada.';
        if (!bookingDate) return 'Data/Hora inválida do agendamento.';
        if (bookingDate.getTime() <= now.getTime()) return 'A mentoria já começou ou já passou.';
        if (!['pending', 'confirmed'].includes(booking.status)) return 'Somente agendamentos pendentes ou confirmados podem ser cancelados.';
        return null;
    };

    // Dividir agendamentos em duas seções: como Mentor e como Mentorado (por id ou email)
    const bookingsAsMentor = bookings.filter((b) => b.mentor_id === user?.id);
    const bookingsAsStudent = bookings.filter((b) => b.student_id === (user?.id || '') || b.student_email === (user?.email || ''));

    const getSubjectDisplay = (booking: Booking) => booking.subject_name || booking.subject_id || '—';

    const getBookingDate = (booking: Booking): Date | null => {
        const base = booking.date?.trim();
        const t = booking.time?.trim();
        if (!base) return null;
        let iso = base;
        if (t) {
            const time = t.length === 5 ? `${t}:00` : t; // garante segundos
            iso = `${base}T${time}`;
        }
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
    };

    // Suporte a foco/destaque de um agendamento vindo das notificações
    const highlightBookingId: string | undefined = location?.state?.highlightBookingId;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Cabecalho />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>Carregando seus agendamentos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Cabecalho />

            <section className="py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Auto scroll para o agendamento destacado */}
                    {highlightBookingId && (
                        <span
                            className="sr-only"
                            ref={() => {
                                const el = document.getElementById(`booking-${highlightBookingId}`);
                                if (el) {
                                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                                }
                            }}
                        />
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Meus Agendamentos</h1>
                        <p className="text-muted-foreground">
                            Gerencie suas mentorias agendadas e finalize as que já foram realizadas.
                        </p>
                    </div>

                    {bookings.length === 0 ? (
                        <Card className="bg-gradient-card border-0 shadow-card">
                            <CardContent className="text-center py-12">
                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
                                <p className="text-muted-foreground mb-4">
                                    Você ainda não possui agendamentos de mentoria.
                                </p>
                                <Button onClick={() => navigate("/")}>
                                    Buscar Mentores
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Como Mentor</h2>
                                {bookingsAsMentor.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Você não possui agendamentos como mentor.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bookingsAsMentor.map((booking) => {
                                            const initials = (booking.student_name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase();
                                            const bookingDate = getBookingDate(booking);
                                            const isPast = bookingDate ? bookingDate < new Date() : false;
                                            const isHighlighted = highlightBookingId && booking.id === highlightBookingId;

                                            return (
                                                <Card
                                                    key={booking.id}
                                                    id={`booking-${booking.id}`}
                                                    className={cn(
                                                        "bg-gradient-card border-0 shadow-card",
                                                        isHighlighted && "ring-2 ring-primary/50 bg-primary/5"
                                                    )}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-4">
                                                                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                                                    <AvatarFallback className="text-sm font-bold bg-gradient-primary text-white">
                                                                        {initials}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h3 className="font-semibold text-lg">{booking.student_name}</h3>
                                                                        {getStatusBadge(booking.status)}
                                                                    </div>

                                                                    <div className="space-y-2 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>
                                                                                {bookingDate ? format(bookingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data inválida'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>
                                                                                {booking.time} - {booking.duration} minutos
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <User className="h-4 w-4" />
                                                                            <span>Matéria: {getSubjectDisplay(booking)}</span>
                                                                        </div>

                                                                        {booking.objective && (
                                                                            <div className="mt-3">
                                                                                <p className="font-medium text-foreground mb-1">Objetivo:</p>
                                                                                <p className="text-sm">{booking.objective}</p>
                                                                            </div>
                                                                        )}
                                                                        {booking.status === 'cancelled' && booking.cancel_reason && (
                                                                            <div className="mt-3">
                                                                                <p className="font-medium text-foreground mb-1 text-red-600">Motivo do cancelamento:</p>
                                                                                <p className="text-sm text-muted-foreground">{booking.cancel_reason}</p>
                                                                            </div>
                                                                        )}
                                                                        {booking.status === 'cancelled' && booking.cancel_reason && (
                                                                            <div className="mt-3">
                                                                                <p className="font-medium text-foreground mb-1 text-red-600">Motivo do cancelamento:</p>
                                                                                <p className="text-sm text-muted-foreground">{booking.cancel_reason}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-2">
                                                                <DialogoChat
                                                                    bookingId={booking.id}
                                                                    bookingTitle={`Chat - ${booking.student_name}`}
                                                                />

                                                                <DialogoCancelarAgendamento
                                                                    onConfirm={(message) => handleCancelBooking(booking.id, message)}
                                                                    disabled={actionLoading === booking.id || !canCancel(booking)}
                                                                    disabledTooltip={getCancelDisabledReason(booking) || undefined}
                                                                />

                                                                {canComplete(booking) && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleCompleteBooking(booking.id)}
                                                                        disabled={actionLoading === booking.id}
                                                                    >
                                                                        {actionLoading === booking.id ? "Finalizando..." : "Finalizar"}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold mb-4">Como Mentorado</h2>
                                {bookingsAsStudent.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Você não possui agendamentos como mentorado.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bookingsAsStudent.map((booking) => {
                                            const initials = (booking.student_name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase();
                                            const bookingDate = getBookingDate(booking);
                                            const isPast = bookingDate ? bookingDate < new Date() : false;
                                            const isHighlighted = highlightBookingId && booking.id === highlightBookingId;

                                            return (
                                                <Card
                                                    key={booking.id}
                                                    id={`booking-${booking.id}`}
                                                    className={cn(
                                                        "bg-gradient-card border-0 shadow-card",
                                                        isHighlighted && "ring-2 ring-primary/50 bg-primary/5"
                                                    )}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-4">
                                                                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                                                    <AvatarFallback className="text-sm font-bold bg-gradient-primary text-white">
                                                                        {initials}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h3 className="font-semibold text-lg">{booking.student_name}</h3>
                                                                        {getStatusBadge(booking.status)}
                                                                    </div>

                                                                    <div className="space-y-2 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>
                                                                                {bookingDate ? format(bookingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data inválida'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>
                                                                                {booking.time} - {booking.duration} minutos
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <User className="h-4 w-4" />
                                                                            <span>Matéria: {getSubjectDisplay(booking)}</span>
                                                                        </div>

                                                                        {booking.objective && (
                                                                            <div className="mt-3">
                                                                                <p className="font-medium text-foreground mb-1">Objetivo:</p>
                                                                                <p className="text-sm">{booking.objective}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-2">
                                                                <DialogoChat
                                                                    bookingId={booking.id}
                                                                    bookingTitle={`Chat - ${booking.student_name}`}
                                                                />

                                                                <DialogoCancelarAgendamento
                                                                    onConfirm={(message) => handleCancelBooking(booking.id, message)}
                                                                    disabled={actionLoading === booking.id || !canCancel(booking)}
                                                                    disabledTooltip={getCancelDisabledReason(booking) || undefined}
                                                                />

                                                                {canComplete(booking) && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleCompleteBooking(booking.id)}
                                                                        disabled={actionLoading === booking.id}
                                                                    >
                                                                        {actionLoading === booking.id ? "Finalizando..." : "Finalizar"}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default MyBookings;
