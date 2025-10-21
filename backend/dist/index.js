"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const disciplinas_1 = __importDefault(require("./rotas/disciplinas"));
const perfis_1 = __importDefault(require("./rotas/perfis"));
const graduacoes_1 = __importDefault(require("./rotas/graduacoes"));
const mentores_1 = __importDefault(require("./rotas/mentores"));
const mentor_disciplinas_1 = __importDefault(require("./rotas/mentor-disciplinas"));
const estudantes_1 = __importDefault(require("./rotas/estudantes"));
const agendamentos_1 = __importDefault(require("./rotas/agendamentos"));
const autenticacao_1 = __importDefault(require("./rotas/autenticacao"));
const usuarios_1 = __importDefault(require("./rotas/usuarios"));
const mensagens_1 = __importDefault(require("./rotas/mensagens"));
const notificacoes_1 = __importDefault(require("./rotas/notificacoes"));
const bootstrap_1 = require("./bootstrap");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Middleware para garantir schema no cold start (Vercel)
let schemaInitialized = false;
app.use(async (req, res, next) => {
    if (!schemaInitialized && process.env.NODE_ENV === 'production') {
        try {
            await (0, bootstrap_1.ensureSchema)();
            schemaInitialized = true;
        }
        catch (err) {
            console.error('Schema initialization failed:', err);
        }
    }
    next();
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/subjects', disciplinas_1.default);
app.use('/api/profiles', perfis_1.default);
app.use('/api/graduations', graduacoes_1.default);
app.use('/api/mentors', mentores_1.default);
app.use('/api/mentor-subjects', mentor_disciplinas_1.default);
app.use('/api/students', estudantes_1.default);
app.use('/api/bookings', agendamentos_1.default);
app.use('/api/auth', autenticacao_1.default);
app.use('/api/users', usuarios_1.default);
app.use('/api/messages', mensagens_1.default);
app.use('/api/notifications', notificacoes_1.default);
// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    (0, bootstrap_1.ensureSchema)()
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
exports.default = app;
