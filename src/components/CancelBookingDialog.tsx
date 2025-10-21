import { useState } from "react";
import { XCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancelBookingDialogProps {
    onConfirm: (message: string) => Promise<void>;
    disabled?: boolean;
}

export const CancelBookingDialog = ({ onConfirm, disabled }: CancelBookingDialogProps) => {
    const [open, setOpen] = useState(false);
    const [cancelMessage, setCancelMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!cancelMessage.trim()) return;

        setLoading(true);
        try {
            await onConfirm(cancelMessage);
            setOpen(false);
            setCancelMessage("");
        } catch (error) {
            console.error("Erro ao cancelar:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700"
                >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Por favor, informe o motivo do cancelamento.
                        Uma notificação será enviada para a outra parte.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-4">
                    <Label htmlFor="cancel-message">Motivo do cancelamento *</Label>
                    <Textarea
                        id="cancel-message"
                        placeholder="Ex: Imprevistos com meu horário..."
                        value={cancelMessage}
                        onChange={(e) => setCancelMessage(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    {cancelMessage.trim().length > 0 && cancelMessage.trim().length < 10 && (
                        <p className="text-sm text-muted-foreground">
                            Mínimo de 10 caracteres
                        </p>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Voltar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        disabled={!cancelMessage.trim() || cancelMessage.trim().length < 10 || loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading ? "Cancelando..." : "Confirmar Cancelamento"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
