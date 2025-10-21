"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { graduation_id } = req.query;
        let query = 'SELECT * FROM subjects';
        const params = [];
        if (graduation_id) {
            query += ' WHERE graduation_id = $1';
            params.push(graduation_id);
        }
        query += ' ORDER BY name LIMIT 100';
        const result = await db_1.pool.query(query, params);
        return res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
