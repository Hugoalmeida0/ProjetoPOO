import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subjectsRouter from './routes/disciplinas';
import profilesRouter from './routes/perfis';
import graduationsRouter from './routes/graduacoes';
import mentorsRouter from './routes/mentores';
import mentorSubjectsRouter from './routes/mentor-disciplinas';
import studentsRouter from './routes/estudantes';
import bookingsRouter from './routes/agendamentos';
import authRouter from './routes/autenticacao';
import usersRouter from './routes/usuarios';
import messagesRouter from './routes/mensagens';
import notificationsRouter from './routes/notificacoes';
import ratingsRouter from './routes/avaliacoes';
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
app.use('/api/ratings', ratingsRouter);

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
