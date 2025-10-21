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

// GET /api/notifications - Buscar todas as notificações do usuário
router.get('/', auth, async (req: Request & { userId?: string }, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await pool.query(
      `SELECT n.*, b.date as booking_date, b.time as booking_time
       FROM notifications n
       LEFT JOIN bookings b ON n.booking_id = b.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// GET /api/notifications/unread-count - Contar notificações não lidas
router.get('/unread-count', auth, async (req: Request & { userId?: string }, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Erro ao contar notificações:', error);
    res.status(500).json({ error: 'Erro ao contar notificações' });
  }
});

// PATCH /api/notifications/:id/read - Marcar notificação como lida
router.patch('/:id/read', auth, async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const result = await pool.query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
  }
});

// PATCH /api/notifications/mark-all-read - Marcar todas como lidas
router.patch('/mark-all-read', auth, async (req: Request & { userId?: string }, res: Response) => {
  try {
    const userId = req.userId!;

    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
  }
});

export default router;
