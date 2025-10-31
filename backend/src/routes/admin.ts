import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

const router = Router();

// Middleware para autenticar via Bearer JWT
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

// Middleware para verificar se o usuário é admin
async function adminOnly(req: Request & { userId?: string }, res: Response, next: NextFunction) {
    try {
        const { rows } = await pool.query(
            'SELECT email FROM users WHERE id = $1',
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'user not found' });
        }

        // Verificar se o email é do admin
        if (rows[0].email !== 'admin@gmail.com') {
            return res.status(403).json({ error: 'access denied - admin only' });
        }

        next();
    } catch (err) {
        console.error('adminOnly middleware error:', err);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}

// GET /api/admin/users - Listar todos os usuários com seus perfis
router.get('/users', auth, adminOnly, async (req: Request, res: Response) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.full_name,
                u.created_at,
                p.bio,
                p.phone,
                mp.location,
                CASE 
                    WHEN mp.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_mentor,
                mp.experience_years,
                COALESCE(CAST(mp.avg_rating AS FLOAT), 0) as avg_rating,
                COALESCE(mp.total_ratings, 0) as total_ratings,
                g.name as graduation_name
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
            LEFT JOIN graduations g ON mp.graduation_id = g.id
            ORDER BY u.created_at DESC
        `);

        return res.json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({
            error: 'Internal server error',
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.stack : undefined) : undefined
        });
    }
});

// GET /api/admin/mentorships - Listar todas as mentorias realizadas
router.get('/mentorships', auth, adminOnly, async (req: Request, res: Response) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                b.id,
                b.date,
                b.time,
                b.duration,
                b.status,
                b.objective,
                b.created_at,
                b.updated_at,
                b.student_name,
                b.student_email,
                b.student_phone,
                b.cancel_reason,
                s_user.full_name as student_full_name,
                s_user.email as student_user_email,
                m_user.full_name as mentor_full_name,
                m_user.email as mentor_email,
                COALESCE(b.subject_name, subj.name) as subject_name,
                g.name as graduation_name,
                r.rating,
                r.comment as rating_comment
            FROM bookings b
            LEFT JOIN users s_user ON b.student_id = s_user.id
            LEFT JOIN users m_user ON b.mentor_id = m_user.id
            LEFT JOIN subjects subj ON b.subject_id = subj.id
            LEFT JOIN mentor_profiles mp ON b.mentor_id = mp.user_id
            LEFT JOIN graduations g ON mp.graduation_id = g.id
            LEFT JOIN ratings r ON b.id = r.booking_id
            ORDER BY b.created_at DESC
        `);

        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
