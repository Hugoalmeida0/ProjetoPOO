import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subjectsRouter from './rotas/disciplinas';
import profilesRouter from './rotas/perfis';
import graduationsRouter from './rotas/graduacoes';
import mentorsRouter from './rotas/mentores';
import mentorSubjectsRouter from './rotas/mentor-disciplinas';
import studentsRouter from './rotas/estudantes';
import bookingsRouter from './rotas/agendamentos';
import authRouter from './rotas/autenticacao';
import usersRouter from './rotas/usuarios';
import messagesRouter from './rotas/mensagens';
import notificationsRouter from './rotas/notificacoes';
import { ensureSchema } from './bootstrap';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para garantir schema no cold start (Vercel)
let schemaInitialized = false;
app.use(async (req, res, next) => {
    if (!schemaInitialized && process.env.NODE_ENV === 'production') {
        try {
            await ensureSchema();
            schemaInitialized = true;
        } catch (err) {
            console.error('Schema initialization failed:', err);
        }
    }
    next();
});

app.get('/api/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

app.use('/api/subjects', subjectsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/graduations', graduationsRouter);
app.use('/api/mentors', mentorsRouter);
app.use('/api/mentor-subjects', mentorSubjectsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    ensureSchema()
        .then(() => {
            app.listen(port, () => {
                console.log(`Server started on port ${port}`);
            });
        })
        .catch((err) => {
            console.error('Failed to bootstrap schema', err);
            process.exit(1);
        });
}

// Para Vercel serverless (CommonJS export)
module.exports = app;
export default app;
