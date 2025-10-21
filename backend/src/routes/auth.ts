import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';

const router = Router();

function signToken(payload: any) {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, full_name } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

        const { rows: existing } = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'email already registered' });

        const newId = uuidv4();
        const { rows } = await pool.query(
            `INSERT INTO users (id, email, password, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name`,
            [newId, email, password, full_name]
        );

        // ensure profile
        await pool.query(
            `INSERT INTO profiles (user_id, full_name, email, is_mentor)
       VALUES ($1, $2, $3, false)
       ON CONFLICT (user_id) DO NOTHING`,
            [rows[0].id, rows[0].full_name, rows[0].email]
        );

        const token = signToken({ sub: rows[0].id, email });
        return res.status(201).json({ token, user: rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

        // Para testes: comparar senha em texto plano (password)
        const { rows } = await pool.query('SELECT id, email, full_name, password FROM users WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'invalid credentials' });

        if (rows[0].password !== password) return res.status(401).json({ error: 'invalid credentials' });

        const token = signToken({ sub: rows[0].id, email });
        const { password: _password, ...user } = rows[0];
        return res.json({ token, user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Me
router.get('/me', async (req: Request, res: Response) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!token) return res.status(401).json({ error: 'missing token' });
    const secret = process.env.JWT_SECRET || 'dev-secret';
        const decoded: any = jwt.verify(token, secret);
        const { rows } = await pool.query('SELECT id, email, full_name FROM users WHERE id = $1', [decoded.sub]);
        if (rows.length === 0) return res.status(404).json({ error: 'user not found' });
        return res.json({ user: rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'invalid token' });
    }
});

export default router;
