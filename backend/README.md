# Backend for UVV Mentor Connect

Backend TypeScript Express que conecta ao PostgreSQL hospedado (Neon) e expõe endpoints REST para o frontend.

## Setup rápido (Windows PowerShell)

### 1. Configurar variáveis de ambiente

Copie `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

Edite `.env` e preencha `DATABASE_URL` com sua connection string do Neon:

```
DATABASE_URL="postgresql://neondb_owner:npg_zwY1rFxad5AV@ep-snowy-dew-acxzaior-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=4000
```

### 2. Instalar dependências

No diretório `backend/`:

```powershell
npm install
```

### 3. Executar servidor de desenvolvimento

```powershell
npm run dev
```

O servidor estará rodando em `http://localhost:4000`.

### 4. Testar conexão

Abra o navegador em `http://localhost:4000/api/health` — você deve ver:

```json
{"status":"ok"}
```

## Endpoints disponíveis

### Health
- **GET /api/health** → `{ status: 'ok' }`

### Subjects (Matérias)
- **GET /api/subjects** → lista todas matérias
- **GET /api/subjects?graduation_id=xxx** → filtra por graduação

### Graduations (Cursos)
- **GET /api/graduations** → lista todos cursos

### Profiles (Perfis)
- **GET /api/profiles** → lista todos perfis
- **GET /api/profiles/:userId** → busca perfil por user_id
- **POST /api/profiles** → cria novo perfil
- **PUT /api/profiles/:userId** → atualiza perfil
- **DELETE /api/profiles/:userId** → deleta perfil

### Students (Estudantes)
- **GET /api/students** → lista estudantes (is_mentor=false)
- **GET /api/students/:userId** → busca estudante por user_id
- **POST /api/students** → cria novo estudante
- **PUT /api/students/:userId** → atualiza estudante
- **DELETE /api/students/:userId** → deleta estudante

### Mentors (Mentores)
- **GET /api/mentors** → lista todos mentores
- **GET /api/mentors/:userId** → busca mentor por user_id
- **POST /api/mentors** → cria novo mentor
- **PUT /api/mentors/:userId** → atualiza mentor
- **DELETE /api/mentors/:userId** → deleta mentor

### Bookings (Agendamentos)
- **GET /api/bookings/user/:userId** → agendamentos do usuário (student ou mentor)
- **GET /api/bookings/mentor/:mentorId** → agendamentos do mentor (pending/confirmed)
- **POST /api/bookings** → cria novo agendamento
- **PUT /api/bookings/:bookingId** → atualiza status do agendamento

## Build para produção

```powershell
npm run build
npm start
```

## Notas importantes

- Este servidor **NÃO** implementa autenticação (JWT/sessions). Todos endpoints são públicos.
 - Autenticação implementada no backend via JWT (rotas /api/auth/*). Configure JWT_SECRET no .env.
- Para produção, considere adicionar validação de tokens e autorização.
- O pool de conexões do `pg` é configurado automaticamente pela connection string.

