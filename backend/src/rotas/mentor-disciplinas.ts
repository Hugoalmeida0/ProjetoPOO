import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// Get subjects for a specific mentor
router.get('/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;

        const result = await pool.query(
            `SELECT s.* 
             FROM subjects s
             JOIN mentor_subjects ms ON s.id = ms.subject_id
             WHERE ms.mentor_id = $1
             ORDER BY s.name`,
            [mentorId]
        );

        res.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching mentor subjects:', error);
        res.status(500).json({ error: error.message });
    }
});

// Set subjects for a mentor (replaces all existing)
router.post('/:mentorId', async (req, res) => {
    const client = await pool.connect();
    try {
        const { mentorId } = req.params;
        const { subject_ids } = req.body;

        if (!Array.isArray(subject_ids)) {
            return res.status(400).json({ error: 'subject_ids must be an array' });
        }

        // Verificar se o user (mentor) existe
        const userCheck = await client.query(
            'SELECT id FROM users WHERE id = $1',
            [mentorId]
        );
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        await client.query('BEGIN');

        // Delete existing subjects for this mentor
        await client.query(
            'DELETE FROM mentor_subjects WHERE mentor_id = $1',
            [mentorId]
        );

        // Insert new subjects
        if (subject_ids.length > 0) {
            const values = subject_ids.map((subjectId, idx) =>
                `($1, $${idx + 2})`
            ).join(', ');

            await client.query(
                `INSERT INTO mentor_subjects (mentor_id, subject_id) VALUES ${values}`,
                [mentorId, ...subject_ids]
            );
        }

        await client.query('COMMIT');

        // Return updated subjects
        const result = await client.query(
            `SELECT s.* 
             FROM subjects s
             JOIN mentor_subjects ms ON s.id = ms.subject_id
             WHERE ms.mentor_id = $1
             ORDER BY s.name`,
            [mentorId]
        );

        res.json(result.rows);
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error setting mentor subjects:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Add a subject to a mentor
router.post('/:mentorId/add', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { subject_id } = req.body;

        await pool.query(
            `INSERT INTO mentor_subjects (mentor_id, subject_id)
             VALUES ($1, $2)
             ON CONFLICT (mentor_id, subject_id) DO NOTHING`,
            [mentorId, subject_id]
        );

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error adding mentor subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove a subject from a mentor
router.delete('/:mentorId/:subjectId', async (req, res) => {
    try {
        const { mentorId, subjectId } = req.params;

        await pool.query(
            'DELETE FROM mentor_subjects WHERE mentor_id = $1 AND subject_id = $2',
            [mentorId, subjectId]
        );

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error removing mentor subject:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
