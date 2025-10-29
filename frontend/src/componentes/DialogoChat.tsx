import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/componentes/ui/dialog";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { ScrollArea } from "@/componentes/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { useMessages } from "@/hooks/useMensagens";
import { useAuth } from "@/hooks/useAutenticacao";
import { cn } from "@/lib/utils";

interface ChatDialogProps {
    bookingId: string;
    bookingTitle?: string;
}

export const ChatDialog = ({ bookingId, bookingTitle }: ChatDialogProps) => {
    const [open, setOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    const { messages, loading, sendMessage } = useMessages(open ? bookingId : null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll ao receber novas mensagens
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await sendMessage(newMessage);
            setNewMessage("");
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {bookingTitle || "Chat da Mentoria"}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea ref={scrollRef} className="flex-1 pr-4">
                    {loading && messages.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Carregando mensagens...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Nenhuma mensagem ainda. Inicie a conversa!</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            {messages.map((message) => {
                                const isOwnMessage = message.sender_id === user?.id;
                                const initials = message.sender_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase();

                                return (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex gap-3",
                                            isOwnMessage ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs bg-gradient-primary text-white">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={cn(
                                                "flex flex-col max-w-[70%]",
                                                isOwnMessage ? "items-end" : "items-start"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium">
                                                    {isOwnMessage ? "Você" : message.sender_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(message.created_at), "HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "rounded-lg px-4 py-2",
                                                    isOwnMessage
                                                        ? "bg-gradient-primary text-white"
                                                        : "bg-muted"
                                                )}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                    <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                    />
                    <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
