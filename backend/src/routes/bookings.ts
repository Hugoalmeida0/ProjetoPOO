import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET bookings by user (student or mentor)
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT * FROM bookings 
       WHERE student_id = $1 OR mentor_id = $1
       ORDER BY date, time`,
            [userId]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET bookings by mentor
router.get('/mentor/:mentorId', async (req: Request, res: Response) => {
    try {
        const { mentorId } = req.params;
        const result = await pool.query(
            `SELECT * FROM bookings 
       WHERE mentor_id = $1 
       AND status IN ('pending', 'confirmed')
       ORDER BY date, time`,
            [mentorId]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST create booking
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            student_id,
            mentor_id,
            subject_id,
            subject_name,
            date,
            time,
            duration,
            objective,
            student_name,
            student_email,
            student_phone,
            status = 'pending'
        } = req.body;

        // Validate required fields - aceitar subject_id OU subject_name
        if (!student_id || !mentor_id || (!subject_id && !subject_name) || !date || !time || !duration || !student_name || !student_email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Se não tiver subject_id mas tiver subject_name, criar/buscar um subject genérico
        let finalSubjectId = subject_id;
        const finalSubjectName = subject_name || null;

        if (!finalSubjectId && subject_name) {
            // Tentar buscar ou criar um subject "Outros" para usar como fallback
            try {
                const genericSubject = await pool.query(
                    `SELECT id FROM subjects WHERE name = 'Outros' LIMIT 1`
                );
                
                if (genericSubject.rows.length > 0) {
                    finalSubjectId = genericSubject.rows[0].id;
                } else {
                    // Criar subject genérico se não existir
                    const newSubject = await pool.query(
                        `INSERT INTO subjects (name) VALUES ('Outros') RETURNING id`
                    );
                    finalSubjectId = newSubject.rows[0].id;
                }
            } catch (err) {
                console.error('Erro ao buscar/criar subject genérico:', err);
                // Se falhar, deixar null mesmo
                finalSubjectId = null;
            }
        }

        // Tentar inserir com subject_name primeiro, se falhar, tentar sem
        let result;
        try {
            result = await pool.query(
                `INSERT INTO bookings 
           (student_id, mentor_id, subject_id, subject_name, date, time, duration, objective, student_name, student_email, student_phone, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *`,
                [student_id, mentor_id, finalSubjectId, finalSubjectName, date, time, duration, objective, student_name, student_email, student_phone, status]
            );
        } catch (insertErr: any) {
            // Se o erro for por coluna inexistente, tentar sem subject_name
            if (insertErr.message?.includes('subject_name') || insertErr.code === '42703') {
                console.warn('Coluna subject_name não existe, inserindo sem ela');
                result = await pool.query(
                    `INSERT INTO bookings 
               (student_id, mentor_id, subject_id, date, time, duration, objective, student_name, student_email, student_phone, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               RETURNING *`,
                    [student_id, mentor_id, finalSubjectId, date, time, duration, objective, student_name, student_email, student_phone, status]
                );
            } else {
                throw insertErr;
            }
        }

        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update booking status
router.put('/:bookingId', async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'status is required' });
        }

        const result = await pool.query(
            `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, bookingId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
