import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = Router();

// Middleware de autenticação
function auth(req: Request & { userId?: string }, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!token) return res.status(401).json({ error: 'missing token' });
        const secret = process.env.JWT_SECRET || 'dev-secret';
        const decoded: any = jwt.verify(token, secret);
        req.userId = decoded.sub as string;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'invalid token' });
    }
}

// POST /api/ratings - Criar nova avaliação
router.post('/', auth, async (req: Request & { userId?: string }, res: Response) => {
    try {
        const userId = req.userId!;
        const { booking_id, rating, comment } = req.body;

        // Validar campos obrigatórios
        if (!booking_id || !rating) {
            return res.status(400).json({ error: 'booking_id e rating são obrigatórios' });
        }

        // Validar rating
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({ error: 'rating deve ser um número inteiro entre 1 e 5' });
        }

        // Buscar informações do agendamento
        const bookingResult = await pool.query(
            `SELECT student_id, mentor_id, status FROM bookings WHERE id = $1`,
            [booking_id]
        );

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        const booking = bookingResult.rows[0];

        // Verificar se o usuário é o estudante do agendamento
        if (booking.student_id !== userId) {
            return res.status(403).json({ error: 'Apenas o estudante pode avaliar a mentoria' });
        }

        // Verificar se o agendamento está finalizado
        if (booking.status !== 'completed') {
            return res.status(400).json({ error: 'Apenas mentorias finalizadas podem ser avaliadas' });
        }

        // Verificar se já existe uma avaliação para este agendamento
        const existingRatingResult = await pool.query(
            `SELECT id FROM ratings WHERE booking_id = $1`,
            [booking_id]
        );

        if (existingRatingResult.rows.length > 0) {
            return res.status(400).json({ error: 'Esta mentoria já foi avaliada' });
        }

        // Criar a avaliação
        const result = await pool.query(
            `INSERT INTO ratings (booking_id, student_id, mentor_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [booking_id, userId, booking.mentor_id, rating, comment || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/ratings/mentor/:mentorId - Buscar avaliações de um mentor
router.get('/mentor/:mentorId', async (req: Request, res: Response) => {
    try {
        const { mentorId } = req.params;

        const result = await pool.query(
            `SELECT r.*, b.subject_name, b.date, b.time,
                    u.full_name as student_name
             FROM ratings r
             JOIN bookings b ON r.booking_id = b.id
             JOIN users u ON r.student_id = u.id
             WHERE r.mentor_id = $1
             ORDER BY r.created_at DESC`,
            [mentorId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar avaliações do mentor:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/ratings/booking/:bookingId - Verificar se agendamento já foi avaliado
router.get('/booking/:bookingId', auth, async (req: Request & { userId?: string }, res: Response) => {
    try {
        const { bookingId } = req.params;
        const userId = req.userId!;

        const result = await pool.query(
            `SELECT id, rating, comment, created_at 
             FROM ratings 
             WHERE booking_id = $1 AND student_id = $2`,
            [bookingId, userId]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json(null);
        }
    } catch (error) {
        console.error('Erro ao verificar avaliação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;
