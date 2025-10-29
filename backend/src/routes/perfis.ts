import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// GET all profiles
router.get('/', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM profiles ORDER BY id LIMIT 200');
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET profile by user_id
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE profile
router.post('/', async (req: Request, res: Response) => {
    try {
        const { user_id, full_name, email, phone, avatar_url, bio, is_mentor } = req.body;
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        const result = await pool.query(
            `INSERT INTO profiles (user_id, full_name, email, phone, avatar_url, bio, is_mentor)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [user_id, full_name, email, phone, avatar_url, bio, is_mentor ?? false]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE profile by user_id
router.put('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const updates = req.body || {};
        const keys = Object.keys(updates).filter(k => k !== 'user_id' && k !== 'id');
        if (keys.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map(k => updates[k]);
        const result = await pool.query(
            `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
            [userId, ...values]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE profile by user_id
router.delete('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query('DELETE FROM profiles WHERE user_id = $1 RETURNING *', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
