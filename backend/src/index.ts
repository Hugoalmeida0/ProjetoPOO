import express, { Request, Response } from 'express';
import http from 'http';
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
import ratingsRouter from './rotas/avaliacoes';
import { ensureSchema } from './bootstrap';
import { setIO } from './realtime';

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

// Para desenvolvimento local: iniciar servidor HTTP e opcionalmente habilitar socket.io se disponível
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    ensureSchema()
        .then(() => {
            // Criar servidor HTTP explícito para permitir encaixar socket.io quando instalado
            const server = http.createServer(app);
            // Tentar carregar socket.io dinamicamente (se a lib estiver instalada)
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { Server } = require('socket.io');
                const io = new Server(server, {
                    cors: {
                        origin: true,
                        credentials: true,
                    },
                });

                // Conectar logs simples
                io.on('connection', (socket: any) => {
                    console.log('Realtime client connected:', socket.id);

                    // permitir que o cliente entre em rooms por booking ou por user
                    socket.on('join:booking', (bookingId: string) => {
                        try {
                            socket.join(`booking-${bookingId}`);
                            console.log(`Socket ${socket.id} joined booking-${bookingId}`);
                        } catch (e) {
                            console.warn('Failed join booking room', String(e));
                        }
                    });

                    socket.on('leave:booking', (bookingId: string) => {
                        try {
                            socket.leave(`booking-${bookingId}`);
                            console.log(`Socket ${socket.id} left booking-${bookingId}`);
                        } catch (e) {
                            console.warn('Failed leave booking room', String(e));
                        }
                    });

                    socket.on('join:user', (userId: string) => {
                        try {
                            socket.join(`user-${userId}`);
                            console.log(`Socket ${socket.id} joined user-${userId}`);
                        } catch (e) {
                            console.warn('Failed join user room', String(e));
                        }
                    });

                    socket.on('disconnect', () => console.log('Realtime client disconnected:', socket.id));
                });

                // Expor io para rotas
                setIO(io);
                console.log('Socket.IO habilitado');
            } catch (err) {
                console.warn('Socket.IO não habilitado (dependência ausente):', String(err));
            }

            server.listen(port, () => {
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
