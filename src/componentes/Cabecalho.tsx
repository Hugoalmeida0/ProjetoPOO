import { Button } from "@/componentes/ui/button";
import { GraduationCap, User, LogOut, Calendar, Settings, LayoutDashboard, Bell, X } from "lucide-react";
import { useAuth } from "@/hooks/useAutenticacao";
import { useNotifications } from "@/hooks/useNotificacoes";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/componentes/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/componentes/ui/dialog";
import { Badge } from "@/componentes/ui/badge";
import { ScrollArea } from "@/componentes/ui/scroll-area";
import { ModalAvaliacao } from "@/componentes/ModalAvaliacao";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Header = () => {
  const { user, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalAvaliacaoOpen, setIsModalAvaliacaoOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Verifica a rota atual para destacar o item ativo
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">UVV Mentor</h1>
              <p className="text-xs text-muted-foreground">Conecte</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/') ? "text-primary font-bold" : "text-foreground"
              )}
            >
              Página Inicial
            </button>
            <button
              onClick={() => navigate('/mentors')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/mentors') ? "text-primary font-bold" : "text-foreground"
              )}
            >
              Mentores
            </button>
            <button
              onClick={() => navigate('/tornar-se-mentor')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/tornar-se-mentor') ? "text-primary font-bold" : "text-foreground"
              )}
            >
              Cadastrar como Mentor
            </button>
            <button
              onClick={() => navigate('/saiba-mais')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/saiba-mais') ? "text-primary font-bold" : "text-foreground"
              )}
            >
              Saiba Mais
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {user?.is_mentor && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        variant="destructive"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle>Notificações</DialogTitle>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Marcar todas como lidas
                        </Button>
                      )}
                    </div>
                  </DialogHeader>

                  <ScrollArea className="max-h-[400px] pr-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Nenhuma notificação</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-colors",
                              notification.read
                                ? "bg-background hover:bg-muted/50"
                                : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                            )}
                            onClick={async () => {
                              try {
                                if (!notification.read) {
                                  await markAsRead(notification.id);
                                }
                              } finally {
                                // Verificar se é uma notificação de finalização de mentoria
                                if (notification.message.includes('finalizada') && notification.booking_id) {
                                  setSelectedBookingId(notification.booking_id);
                                  setIsModalAvaliacaoOpen(true);
                                } else if (notification.booking_id) {
                                  navigate('/meus-agendamentos', { state: { highlightBookingId: notification.booking_id } });
                                }
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm flex-1 underline underline-offset-2">
                                {notification.message}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(notification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.is_mentor && (
                    <DropdownMenuItem onClick={() => navigate("/mentor/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Painel do Mentor
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Minha Conta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/meus-agendamentos")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Meus Agendamentos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
                <Button variant="hero" onClick={() => navigate("/auth")}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Avaliação */}
      <ModalAvaliacao
        isOpen={isModalAvaliacaoOpen}
        onClose={() => {
          setIsModalAvaliacaoOpen(false);
          setSelectedBookingId(null);
        }}
        bookingId={selectedBookingId || ''}
      />
    </header>
  );
};

export default Header;