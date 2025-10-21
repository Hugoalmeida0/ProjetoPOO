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

// GET /api/messages/:bookingId - Buscar todas as mensagens de um agendamento
router.get('/:bookingId', auth, async (req: Request & { userId?: string }, res: Response) => {
    try {
        const { bookingId } = req.params;
        const userId = req.userId!;

        // Verificar se o usuário tem acesso a este agendamento
        const bookingCheck = await pool.query(
            `SELECT * FROM bookings WHERE id = $1 AND (student_id = $2 OR mentor_id = $2)`,
            [bookingId, userId]
        );

        if (bookingCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Acesso negado a este agendamento' });
        }

        // Buscar mensagens ordenadas por data
        const result = await pool.query(
            `SELECT m.*, u.full_name as sender_name, u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.booking_id = $1
       ORDER BY m.created_at ASC`,
            [bookingId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});

// POST /api/messages - Criar nova mensagem
router.post('/', auth, async (req: Request & { userId?: string }, res: Response) => {
    try {
        const { booking_id, content } = req.body;
        const userId = req.userId!;

        if (!booking_id || !content || !content.trim()) {
            return res.status(400).json({ error: 'booking_id e content são obrigatórios' });
        }

        // Verificar se o usuário tem acesso a este agendamento
        const bookingCheck = await pool.query(
            `SELECT student_id, mentor_id FROM bookings WHERE id = $1 AND (student_id = $2 OR mentor_id = $2)`,
            [booking_id, userId]
        );

        if (bookingCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Acesso negado a este agendamento' });
        }

        // Criar mensagem
        const result = await pool.query(
            `INSERT INTO messages (booking_id, sender_id, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
            [booking_id, userId, content.trim()]
        );

        // Buscar nome do remetente
        const messageWithSender = await pool.query(
            `SELECT m.*, u.full_name as sender_name, u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json(messageWithSender.rows[0]);
    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
        res.status(500).json({ error: 'Erro ao criar mensagem' });
    }
});

export default router;
