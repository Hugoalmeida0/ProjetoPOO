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

        // Business rule: impedir que um usuário agende com ele mesmo
        if (student_id === mentor_id) {
            return res.status(400).json({ error: 'Você não pode agendar uma mentoria consigo mesmo.' });
        }

        // Resolver subject_id quando vier apenas subject_name
        let finalSubjectId = subject_id as string | null;
        const finalSubjectName = subject_name || null;

        if (!finalSubjectId && subject_name) {
            try {
                // 1) Descobrir a graduacao do mentor
                const mentorGradRes = await pool.query(
                    `SELECT graduation_id FROM mentor_profiles WHERE user_id = $1 LIMIT 1`,
                    [mentor_id]
                );
                const mentorGraduationId = mentorGradRes.rows?.[0]?.graduation_id || null;

                // 2) Tentar encontrar uma matéria com mesmo nome dentro da graduação do mentor
                if (mentorGraduationId) {
                    const matchRes = await pool.query(
                        `SELECT id FROM subjects WHERE graduation_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
                        [mentorGraduationId, subject_name.trim()]
                    );
                    if (matchRes.rows.length > 0) {
                        finalSubjectId = matchRes.rows[0].id;
                    }
                }

                // 3) Se não encontrou correspondência, criar uma matéria com esse nome na graduação do mentor (se existir)
                if (!finalSubjectId) {
                    const created = await pool.query(
                        `INSERT INTO subjects (id, name, graduation_id) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
                        [subject_name.trim(), mentorGraduationId]
                    );
                    finalSubjectId = created.rows[0]?.id || null;
                }

                // 4) Se por algum motivo a criação falhar, pegar a primeira matéria daquela graduação
                if (!finalSubjectId && mentorGraduationId) {
                    const anyGradSubject = await pool.query(
                        `SELECT id FROM subjects WHERE graduation_id = $1 ORDER BY name LIMIT 1`,
                        [mentorGraduationId]
                    );
                    if (anyGradSubject.rows.length > 0) {
                        finalSubjectId = anyGradSubject.rows[0].id;
                    }
                }

                // 5) Como último recurso, pegar qualquer matéria existente
                if (!finalSubjectId) {
                    const anySubject = await pool.query(
                        `SELECT id FROM subjects ORDER BY name LIMIT 1`
                    );
                    if (anySubject.rows.length > 0) {
                        finalSubjectId = anySubject.rows[0].id;
                    }
                }

                // Se mesmo assim não houver matérias, melhor retornar 400 orientando a cadastrar matérias
                if (!finalSubjectId) {
                    return res.status(400).json({ error: 'Nenhuma matéria cadastrada no sistema. Cadastre matérias em subjects ou informe um subject_id válido.' });
                }
            } catch (err) {
                console.error('Erro ao resolver subject_id a partir de subject_name:', err);
                return res.status(500).json({ error: 'Falha ao resolver a matéria informada. Tente novamente.' });
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
        const { status, cancel_message, user_id } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'status is required' });
        }

        let result;

        // If cancelling, also persist the cancel_reason
        if (status === 'cancelled') {
            try {
                result = await pool.query(
                    `UPDATE bookings SET status = $1, cancel_reason = $3, updated_at = NOW() WHERE id = $2 RETURNING *`,
                    [status, bookingId, cancel_message || null]
                );
            } catch (err: any) {
                // If cancel_reason column doesn't exist for some reason, fallback to status-only update
                if (err?.code === '42703' || (err?.message && err.message.includes('cancel_reason'))) {
                    result = await pool.query(
                        `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
                        [status, bookingId]
                    );
                } else {
                    throw err;
                }
            }
        } else {
            result = await pool.query(
                `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
                [status, bookingId]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = result.rows[0];

        // Se for cancelamento com mensagem, criar notificação para a outra parte
        if (status === 'cancelled' && cancel_message && user_id) {
            // Determinar quem deve receber a notificação
            const recipientId = booking.mentor_id === user_id ? booking.student_id : booking.mentor_id;

            try {
                await pool.query(
                    `INSERT INTO notifications (user_id, message, booking_id, created_at)
                     VALUES ($1, $2, $3, NOW())`,
                    [recipientId, `Agendamento cancelado: ${cancel_message}`, bookingId]
                );
            } catch (notifErr) {
                console.error('Erro ao criar notificação de cancelamento:', notifErr);
                // Não falhar a requisição se a notificação falhar
            }
        }

        // Se for finalização, criar notificação para o estudante
        if (status === 'completed' && user_id) {
            // Determinar quem deve receber a notificação (sempre o estudante)
            const recipientId = booking.student_id;

            try {
                await pool.query(
                    `INSERT INTO notifications (user_id, message, booking_id, created_at)
                     VALUES ($1, $2, $3, NOW())`,
                    [recipientId, `Sua mentoria foi finalizada! Clique aqui para avaliar sua experiência.`, bookingId]
                );
            } catch (notifErr) {
                console.error('Erro ao criar notificação de finalização:', notifErr);
                // Não falhar a requisição se a notificação falhar
            }
        }


        return res.json(booking);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
