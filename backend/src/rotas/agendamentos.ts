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

        const newBooking = result.rows[0];

        // 🔔 NOTIFICAÇÃO: Nova mentoria pendente para o mentor
        if (status === 'pending') {
            try {
                await pool.query(
                    `INSERT INTO notifications (user_id, message, booking_id, created_at, read)
                     VALUES ($1, $2, $3, NOW(), false)`,
                    [mentor_id, 'Você recebeu uma nova solicitação de mentoria! Clique aqui para revisar e confirmar o agendamento.', newBooking.id]
                );
            } catch (notifErr) {
                console.error('Erro ao criar notificação de nova mentoria pendente:', notifErr);
                // Não bloquear a criação do booking por erro na notificação
            }
        }

        return res.status(201).json(newBooking);
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

        // Buscar status anterior para gerar notificação adequada
        const previousBooking = await pool.query(
            `SELECT status, mentor_id, student_id FROM bookings WHERE id = $1`,
            [bookingId]
        );

        if (previousBooking.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const oldStatus = previousBooking.rows[0].status;
        const mentorId = previousBooking.rows[0].mentor_id;
        const studentId = previousBooking.rows[0].student_id;

        // ✅ REGRA DE NEGÓCIO: Só pode finalizar mentoria após confirmação
        if (status === 'completed') {
            if (oldStatus !== 'confirmed' && oldStatus !== 'in-progress') {
                return res.status(400).json({ 
                    error: 'Não é possível finalizar uma mentoria que não foi confirmada. A mentoria deve estar com status "confirmada" ou "em andamento" para ser finalizada.' 
                });
            }
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

        // 🔔 SISTEMA DE NOTIFICAÇÕES AUTOMÁTICAS POR MUDANÇA DE STATUS
        const createNotification = async (recipientId: string, message: string) => {
            try {
                await pool.query(
                    `INSERT INTO notifications (user_id, message, booking_id, created_at, read)
                     VALUES ($1, $2, $3, NOW(), false)`,
                    [recipientId, message, bookingId]
                );
            } catch (notifErr) {
                console.error('Erro ao criar notificação:', notifErr);
            }
        };

        // Apenas notificar se o status mudou
        if (oldStatus !== status) {
            // Determinar quem deve receber a notificação
            // Para a maioria dos casos: notificar a outra parte
            // Para alguns casos específicos: notificar ambas as partes
            const isUserMentor = user_id === mentorId;
            const isUserStudent = user_id === studentId;

            let notificationMessage = '';

            switch (status) {
                case 'cancelled':
                    // Notificar a parte que NÃO cancelou
                    const recipientForCancel = user_id === mentorId ? studentId : mentorId;
                    notificationMessage = cancel_message 
                        ? `Agendamento cancelado: ${cancel_message}` 
                        : 'Seu agendamento foi cancelado.';
                    await createNotification(recipientForCancel, notificationMessage);
                    break;

                case 'confirmed':
                    if (oldStatus === 'pending') {
                        // Notificar o estudante que o mentor confirmou
                        notificationMessage = 'Seu agendamento foi confirmado pelo mentor!';
                        await createNotification(studentId, notificationMessage);
                    }
                    break;

                case 'in-progress':
                    // Notificar ambas as partes que a mentoria iniciou
                    await createNotification(studentId, 'Sua mentoria está em andamento!');
                    if (studentId !== mentorId) {
                        await createNotification(mentorId, 'Sua mentoria está em andamento!');
                    }
                    break;

                case 'completed':
                    // Notificar ambas as partes
                    await createNotification(studentId, 'Sua mentoria foi finalizada! Clique aqui para avaliar sua experiência.');
                    if (studentId !== mentorId) {
                        await createNotification(mentorId, 'Uma mentoria foi finalizada com sucesso.');
                    }
                    break;

                default:
                    // Para outros status, notificar a outra parte
                    const recipientForOther = user_id === mentorId ? studentId : mentorId;
                    notificationMessage = `Status do agendamento alterado para: ${status}`;
                    await createNotification(recipientForOther, notificationMessage);
            }
        }

        return res.json(booking);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
