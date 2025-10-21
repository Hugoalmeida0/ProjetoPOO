"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const db_1 = require("../db");
const router = (0, express_1.Router)();
function signToken(payload) {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
}
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'email and password are required' });
        const { rows: existing } = await db_1.pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (existing.length > 0)
            return res.status(409).json({ error: 'email already registered' });
        const newId = (0, uuid_1.v4)();
        const { rows } = await db_1.pool.query(`INSERT INTO users (id, email, password, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name`, [newId, email, password, full_name]);
        // ensure profile
        await db_1.pool.query(`INSERT INTO profiles (user_id, full_name, email, is_mentor)
       VALUES ($1, $2, $3, false)
       ON CONFLICT (user_id) DO NOTHING`, [rows[0].id, rows[0].full_name, rows[0].email]);
        const token = signToken({ sub: rows[0].id, email });
        return res.status(201).json({ token, user: rows[0] });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'email and password are required' });
        // Para testes: comparar senha em texto plano (password)
        const { rows } = await db_1.pool.query('SELECT id, email, full_name, password FROM users WHERE email = $1', [email]);
        if (rows.length === 0)
            return res.status(401).json({ error: 'invalid credentials' });
        if (rows[0].password !== password)
            return res.status(401).json({ error: 'invalid credentials' });
        const token = signToken({ sub: rows[0].id, email });
        const { password: _password, ...user } = rows[0];
        return res.json({ token, user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Me
router.get('/me', async (req, res) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!token)
            return res.status(401).json({ error: 'missing token' });
        const secret = process.env.JWT_SECRET || 'dev-secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const { rows } = await db_1.pool.query(`SELECT u.id, u.email, u.full_name, COALESCE(p.is_mentor, false) as is_mentor
             FROM users u
             LEFT JOIN profiles p ON p.user_id = u.id
             WHERE u.id = $1`, [decoded.sub]);
        if (rows.length === 0)
            return res.status(404).json({ error: 'user not found' });
        return res.json({ user: rows[0] });
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'invalid token' });
    }
});
exports.default = router;
