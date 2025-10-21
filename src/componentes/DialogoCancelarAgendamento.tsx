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
} from "@/componentes/ui/alert-dialog";
import { Button } from "@/componentes/ui/button";
import { Textarea } from "@/componentes/ui/textarea";
import { Label } from "@/componentes/ui/label";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/componentes/ui/tooltip";
import { Alert, AlertDescription } from "@/componentes/ui/alert";

interface CancelBookingDialogProps {
    onConfirm: (message: string) => Promise<void>;
    disabled?: boolean;
    disabledTooltip?: string;
}

export const CancelBookingDialog = ({ onConfirm, disabled, disabledTooltip }: CancelBookingDialogProps) => {
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
            <TooltipProvider>
                {disabled && disabledTooltip ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
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
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{disabledTooltip}</TooltipContent>
                    </Tooltip>
                ) : (
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
                )}
            </TooltipProvider>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Por favor, informe o motivo do cancelamento.
                        Uma notificação será enviada para a outra parte.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Alert variant="destructive" className="mb-3">
                    <AlertDescription>
                        Atenção: esta é uma ação irreversível. Confirme somente se tiver certeza.
                    </AlertDescription>
                </Alert>

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
