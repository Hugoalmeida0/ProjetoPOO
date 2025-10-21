"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const subjects_1 = __importDefault(require("./routes/subjects"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const graduations_1 = __importDefault(require("./routes/graduations"));
const mentors_1 = __importDefault(require("./routes/mentors"));
const mentor_subjects_1 = __importDefault(require("./routes/mentor-subjects"));
const students_1 = __importDefault(require("./routes/students"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
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
app.use('/api/subjects', subjects_1.default);
app.use('/api/profiles', profiles_1.default);
app.use('/api/graduations', graduations_1.default);
app.use('/api/mentors', mentors_1.default);
app.use('/api/mentor-subjects', mentor_subjects_1.default);
app.use('/api/students', students_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
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
