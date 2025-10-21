import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const { graduation_id } = req.query;

        let query = 'SELECT * FROM subjects';
        const params: any[] = [];

        if (graduation_id) {
            query += ' WHERE graduation_id = $1';
            params.push(graduation_id);
        }

        query += ' ORDER BY name LIMIT 100';

        const result = await pool.query(query, params);
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
