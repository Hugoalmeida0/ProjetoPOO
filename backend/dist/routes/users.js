"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Middleware simples para autenticar via Bearer JWT
function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!token)
            return res.status(401).json({ error: 'missing token' });
        const secret = process.env.JWT_SECRET || 'dev-secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.userId = decoded.sub;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'invalid token' });
    }
}
// GET /api/users/me - obter dados do usuário logado
router.get('/me', auth, async (req, res) => {
    try {
        const { rows } = await db_1.pool.query('SELECT id, email, full_name, created_at FROM users WHERE id = $1', [req.userId]);
        if (rows.length === 0)
            return res.status(404).json({ error: 'user not found' });
        return res.json(rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/users/me - atualizar email e/ou nome
router.put('/me', auth, async (req, res) => {
    try {
        const { email, full_name } = req.body || {};
        if (!email && !full_name)
            return res.status(400).json({ error: 'nothing to update' });
        const fields = [];
        const values = [];
        let idx = 1;
        if (email) {
            fields.push(`email = $${++idx}`);
            values.push(email);
        }
        if (full_name) {
            fields.push(`full_name = $${++idx}`);
            values.push(full_name);
        }
        const { rows } = await db_1.pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING id, email, full_name, created_at`, [req.userId, ...values]);
        if (rows.length === 0)
            return res.status(404).json({ error: 'user not found' });
        // manter perfil sincronizado (opcional)
        if (full_name || email) {
            await db_1.pool.query(`UPDATE profiles SET 
            full_name = COALESCE($2, full_name), 
            email = COALESCE($3, email), 
            updated_at = NOW()
         WHERE user_id = $1`, [req.userId, full_name ?? null, email ?? null]);
        }
        return res.json(rows[0]);
    }
    catch (err) {
        // código 23505 = unique_violation (ex: email já cadastrado)
        if (err?.code === '23505') {
            return res.status(409).json({ error: 'email already registered' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/users/me - excluir usuário e dados relacionados
router.delete('/me', auth, async (req, res) => {
    const client = await db_1.pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.userId;
        // Apagar bookings onde for aluno ou mentor
        await client.query('DELETE FROM bookings WHERE student_id = $1 OR mentor_id = $1', [userId]);
        // Apagar mentor_subjects ligados ao perfil (via profiles.id, mas usamos user_id nos perfis)
        // Primeiro, apagar mentor_profiles
        await client.query('DELETE FROM mentor_profiles WHERE user_id = $1', [userId]);
        // Apagar profile
        await client.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
        // Por fim, apagar usuário
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
        await client.query('COMMIT');
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'user not found' });
        return res.json({ success: true });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
});
exports.default = router;
