import { Button } from "@/componentes/ui/button";
import { GraduationCap, Search, User, LogOut, Calendar, Settings, LayoutDashboard, Bell, X } from "lucide-react";
import { useAuth } from "@/hooks/useAutenticacao";
import { useNotifications } from "@/hooks/useNotificacoes";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/componentes/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/componentes/ui/dialog";
import { Badge } from "@/componentes/ui/badge";
import { ScrollArea } from "@/componentes/ui/scroll-area";
import { cn } from "@/lib/utils";

const Header = () => {
  const { user, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
            <a href="#materias" className="text-foreground hover:text-primary transition-smooth">
              Matérias
            </a>
            <a href="#mentores" className="text-foreground hover:text-primary transition-smooth">
              Mentores
            </a>
            {!user?.is_mentor && (
              <Button
                variant="ghost"
                onClick={() => navigate("/tornar-se-mentor")}
                className="text-foreground hover:text-primary transition-smooth"
              >
                Ser Mentor
              </Button>
            )}
            <a href="#sobre" className="text-foreground hover:text-primary transition-smooth">
              Sobre
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>

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
                                if (notification.booking_id) {
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
    </header>
  );
};

export default Header;