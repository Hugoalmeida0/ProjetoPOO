"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET all mentors with profile info
router.get('/', async (_req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT 
        mp.*,
        json_build_object(
          'user_id', p.user_id,
          'full_name', p.full_name,
          'email', p.email
        ) as profiles
      FROM mentor_profiles mp
      LEFT JOIN profiles p ON mp.user_id = p.user_id
      ORDER BY mp.rating DESC NULLS LAST
    `);
        return res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET mentor by user_id
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db_1.pool.query('SELECT * FROM mentor_profiles WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// POST create mentor
router.post('/', async (req, res) => {
    try {
        const { user_id, graduation_id, location, experience_years, availability, price_per_hour, subjects } = req.body;
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        const result = await db_1.pool.query(`INSERT INTO mentor_profiles (user_id, graduation_id, location, experience_years, availability, price_per_hour, subjects)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [user_id, graduation_id, location, experience_years, availability, price_per_hour, subjects]);
        return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT update mentor
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const fields = Object.keys(updates)
            .filter(key => key !== 'user_id')
            .map((key, idx) => `${key} = $${idx + 2}`)
            .join(', ');
        const values = Object.keys(updates)
            .filter(key => key !== 'user_id')
            .map(key => updates[key]);
        const result = await db_1.pool.query(`UPDATE mentor_profiles SET ${fields}, updated_at = NOW() WHERE user_id = $1 RETURNING *`, [userId, ...values]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE mentor
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db_1.pool.query('DELETE FROM mentor_profiles WHERE user_id = $1 RETURNING *', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
