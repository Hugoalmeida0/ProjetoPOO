import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Lista paginada por graduação, retornando apenas disciplinas com monitores vinculados
router.get('/by-graduation', async (req: Request, res: Response) => {
    try {
        const { graduation_id, page = '1', page_size = '12' } = req.query as Record<string, string>;
        if (!graduation_id) {
            return res.status(400).json({ error: 'graduation_id is required' });
        }

        const pageNum = Math.max(parseInt(page || '1', 10) || 1, 1);
        const pageSizeNum = Math.min(Math.max(parseInt(page_size || '12', 10) || 12, 1), 100);
        const offset = (pageNum - 1) * pageSizeNum;

        // total
        const countResult = await pool.query(
            `SELECT COUNT(DISTINCT s.id) AS total
             FROM subjects s
             JOIN mentor_subjects ms ON ms.subject_id = s.id
             JOIN profiles p ON p.id = ms.mentor_id
             JOIN mentor_profiles mp ON mp.user_id = p.user_id
             WHERE mp.graduation_id = $1`,
            [graduation_id]
        );
        const total = Number(countResult.rows?.[0]?.total || 0);

        // itens paginados
        const listResult = await pool.query(
            `SELECT DISTINCT s.*
             FROM subjects s
             JOIN mentor_subjects ms ON ms.subject_id = s.id
             JOIN profiles p ON p.id = ms.mentor_id
             JOIN mentor_profiles mp ON mp.user_id = p.user_id
             WHERE mp.graduation_id = $1
             ORDER BY s.name
             LIMIT $2 OFFSET $3`,
            [graduation_id, pageSizeNum, offset]
        );

        return res.json({ items: listResult.rows, total, page: pageNum, page_size: pageSizeNum });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const { graduation_id } = req.query;

        // Quando houver graduation_id, retornar apenas matérias associadas a monitores
        // dessa graduação (via mentor_subjects + mentor_profiles). Suporta cenários onde
        // mentor_subjects.mentor_id referencia users.id OU mentor_profiles.id.
        if (graduation_id) {
            const query = `
                SELECT DISTINCT s.*
                FROM subjects s
                JOIN mentor_subjects ms ON ms.subject_id = s.id
                JOIN profiles p ON p.id = ms.mentor_id
                JOIN mentor_profiles mp ON mp.user_id = p.user_id
                WHERE mp.graduation_id = $1
                ORDER BY s.name
                LIMIT 100
            `;
            const result = await pool.query(query, [graduation_id]);
            return res.json(result.rows);
        }

        // Sem filtro: comportamento anterior
        const result = await pool.query('SELECT * FROM subjects ORDER BY name LIMIT 100');
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
