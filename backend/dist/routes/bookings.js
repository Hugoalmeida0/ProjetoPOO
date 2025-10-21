"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET bookings by user (student or mentor)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db_1.pool.query(`SELECT * FROM bookings 
       WHERE student_id = $1 OR mentor_id = $1
       ORDER BY date, time`, [userId]);
        return res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET bookings by mentor
router.get('/mentor/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const result = await db_1.pool.query(`SELECT * FROM bookings 
       WHERE mentor_id = $1 
       AND status IN ('pending', 'confirmed')
       ORDER BY date, time`, [mentorId]);
        return res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// POST create booking
router.post('/', async (req, res) => {
    try {
        const { student_id, mentor_id, subject_id, date, time, duration, objective, student_name, student_email, student_phone, status = 'pending' } = req.body;
        // Validate required fields
        if (!student_id || !mentor_id || !subject_id || !date || !time || !duration || !student_name || !student_email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await db_1.pool.query(`INSERT INTO bookings 
       (student_id, mentor_id, subject_id, date, time, duration, objective, student_name, student_email, student_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`, [student_id, mentor_id, subject_id, date, time, duration, objective, student_name, student_email, student_phone, status]);
        return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT update booking status
router.put('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'status is required' });
        }
        const result = await db_1.pool.query(`UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [status, bookingId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
