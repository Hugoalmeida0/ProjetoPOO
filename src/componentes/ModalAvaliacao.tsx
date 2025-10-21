import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/componentes/ui/dialog';
import { Button } from '@/componentes/ui/button';
import { Textarea } from '@/componentes/ui/textarea';
import { Label } from '@/componentes/ui/label';
import { Star } from 'lucide-react';
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
    const { toast } = useToast();

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
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Avaliar Mentoria</DialogTitle>
                    <DialogDescription>
                        Como foi sua experiência com {mentorName || 'o mentor'}? Sua avaliação nos ajuda a melhorar o serviço.
                    </DialogDescription>
                </DialogHeader>

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
            </DialogContent>
        </Dialog>
    );
};
