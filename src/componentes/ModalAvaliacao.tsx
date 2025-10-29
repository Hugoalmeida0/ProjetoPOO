import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/componentes/ui/dialog';
import { Button } from '@/componentes/ui/button';
import { Textarea } from '@/componentes/ui/textarea';
import { Label } from '@/componentes/ui/label';
import { Star, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/integracoes/api/client';

interface ModalAvaliacaoProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    mentorName?: string;
}

export const ModalAvaliacao = ({ isOpen, onClose, bookingId, mentorName }: ModalAvaliacaoProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [existingRating, setExistingRating] = useState<any>(null);
    const { toast } = useToast();

    // Verificar se já existe uma avaliação ao abrir o modal
    useEffect(() => {
        const checkExistingRating = async () => {
            if (!isOpen || !bookingId) return;
            
            setIsLoading(true);
            try {
                const rating = await apiClient.ratings.getByBookingId(bookingId);
                setExistingRating(rating);
            } catch (error) {
                console.error('Erro ao verificar avaliação existente:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkExistingRating();
    }, [isOpen, bookingId]);

    const handleStarClick = (starRating: number) => {
        setRating(starRating);
    };

    const handleStarHover = (starRating: number) => {
        setHoveredRating(starRating);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({
                title: "Avaliação obrigatória",
                description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.ratings.create({
                booking_id: bookingId,
                rating: rating,
                comment: comment.trim() || undefined,
            });

            toast({
                title: "Avaliação enviada!",
                description: `Obrigado por avaliar sua mentoria com ${mentorName || 'o mentor'}.`,
            });

            // Resetar o formulário
            setRating(0);
            setComment('');
            onClose();
        } catch (error: any) {
            console.error('Erro ao enviar avaliação:', error);
            toast({
                title: "Erro ao enviar avaliação",
                description: error.message || "Tente novamente em alguns instantes.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setComment('');
        setExistingRating(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Avaliar Mentoria</DialogTitle>
                    <DialogDescription>
                        {existingRating 
                            ? "Você já avaliou esta mentoria." 
                            : `Como foi sua experiência com ${mentorName || 'o mentor'}? Sua avaliação nos ajuda a melhorar o serviço.`
                        }
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : existingRating ? (
                    <div className="space-y-6">
                        {/* Mostrar avaliação existente */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <h3 className="font-semibold text-green-900">Avaliação já enviada</h3>
                            </div>
                            
                            {/* Estrelas da avaliação existente */}
                            <div className="flex space-x-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-6 h-6 ${star <= existingRating.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>

                            {existingRating.comment && (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Seu comentário:</p>
                                    <p className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                                        {existingRating.comment}
                                    </p>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 mt-3">
                                Avaliado em {new Date(existingRating.created_at).toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: 'long', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="button" onClick={handleClose}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                    {/* Sistema de Estrelas */}
                    <div className="space-y-2">
                        <Label htmlFor="rating">Avaliação</Label>
                        <div className="flex space-x-1" id="rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => handleStarHover(star)}
                                    onMouseLeave={handleStarLeave}
                                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                    disabled={isSubmitting}
                                >
                                    <Star
                                        className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 hover:text-yellow-400'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-gray-600">
                                {rating === 1 && "Péssimo"}
                                {rating === 2 && "Ruim"}
                                {rating === 3 && "Regular"}
                                {rating === 4 && "Bom"}
                                {rating === 5 && "Excelente"}
                            </p>
                        )}
                    </div>

                    {/* Campo de Comentário */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comentário (opcional)</Label>
                        <Textarea
                            id="comment"
                            placeholder="Conte-nos mais sobre sua experiência..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isSubmitting}
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0}
                        >
                            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                        </Button>
                    </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
