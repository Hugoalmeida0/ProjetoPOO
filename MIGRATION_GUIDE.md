# Migração do Supabase para PostgreSQL (Neon) - Resumo Completo

## O que foi feito

 Migrei todas as chamadas do Supabase para uma API REST própria que conecta ao PostgreSQL hospedado no Neon. Supabase (DB e Auth) foi removido do código.

## Estrutura criada

### Backend (novo)

**Localização:** `backend/`

**Arquivos criados:**
- `package.json` - Dependências (express, pg, dotenv, cors, typescript)
- `tsconfig.json` - Configuração TypeScript
- `.env` - Variáveis de ambiente (DATABASE_URL com connection string Neon)
- `.env.example` - Exemplo de configuração
- `README.md` - Instruções completas
- `src/index.ts` - Servidor Express principal
- `src/db.ts` - Pool de conexão PostgreSQL
- `src/routes/subjects.ts` - Endpoints de matérias
- `src/routes/graduations.ts` - Endpoints de cursos
- `src/routes/profiles.ts` - Endpoints de perfis
- `src/routes/students.ts` - Endpoints de estudantes
- `src/routes/mentors.ts` - Endpoints de mentores
- `src/routes/bookings.ts` - Endpoints de agendamentos

### Frontend (migrado)

**Arquivo novo:**
- `src/integrations/api/client.ts` - Cliente API centralizado (substitui chamadas ao Supabase)

**Arquivos atualizados:**
- `.env` - Adicionada variável `VITE_API_BASE_URL=http://localhost:4000`
- `src/hooks/useSubjects.tsx` - Migrado para API
- `src/hooks/useGraduations.tsx` - Migrado para API
- `src/hooks/useMentors.tsx` - Migrado para API
- `src/hooks/useStudents.tsx` - Migrado para API
- `src/hooks/useBookings.tsx` - Migrado para API
- `src/pages/BecomeMentor.tsx` - Migrado para API
- `src/pages/BookingMentorship.tsx` - Migrado para API
- `src/pages/Auth.tsx` - Autenticação usando API própria (JWT); Supabase removido

Autenticação migrada para backend próprio com JWT; Supabase removido.

## Como executar

### 1. Iniciar o backend

Navegue até o diretório `backend/`:

```powershell
cd backend
npm install
npm run dev
```

O servidor rodará em `http://localhost:4000`.

**Teste rápido:**
Abra `http://localhost:4000/api/health` no navegador.

### 2. Iniciar o frontend

No diretório raiz do projeto:

```powershell
npm run dev
```

O frontend conectará automaticamente à API local via `VITE_API_BASE_URL`.

## Endpoints da API

### Health Check
- `GET /api/health` → `{"status":"ok"}`

### Subjects (Matérias)
- `GET /api/subjects` → todas matérias
- `GET /api/subjects?graduation_id=xxx` → matérias de um curso

### Graduations (Cursos)
- `GET /api/graduations` → todos cursos

### Profiles
- `GET /api/profiles` → todos perfis
- `GET /api/profiles/:userId` → perfil por user_id
- `POST /api/profiles` → criar perfil
- `PUT /api/profiles/:userId` → atualizar perfil
- `DELETE /api/profiles/:userId` → deletar perfil

### Students
- `GET /api/students` → todos estudantes
- `GET /api/students/:userId` → estudante por user_id
- `POST /api/students` → criar estudante
- `PUT /api/students/:userId` → atualizar estudante
- `DELETE /api/students/:userId` → deletar estudante

### Mentors
- `GET /api/mentors` → todos mentores
- `GET /api/mentors/:userId` → mentor por user_id
- `POST /api/mentors` → criar mentor
- `PUT /api/mentors/:userId` → atualizar mentor
- `DELETE /api/mentors/:userId` → deletar mentor

### Bookings
- `GET /api/bookings/user/:userId` → agendamentos do usuário
- `GET /api/bookings/mentor/:mentorId` → agendamentos do mentor
- `POST /api/bookings` → criar agendamento
- `PUT /api/bookings/:bookingId` → atualizar status do agendamento

## Pontos importantes

1. **Autenticação:** O frontend usa backend próprio com JWT. Removemos Supabase Auth.

2. **Queries ao banco:** Todas queries (SELECT, INSERT, UPDATE, DELETE) agora passam pela API REST do backend, que se conecta ao PostgreSQL Neon.

3. **Segurança:** A connection string do PostgreSQL fica APENAS no backend (`.env` do backend). Nunca exponha isso no frontend.

4. **Deploy:** Para produção, você precisará:
   - Hospedar o backend (Vercel Serverless, Heroku, DigitalOcean, etc.)
   - Atualizar `VITE_API_BASE_URL` no `.env` do frontend para apontar para o backend em produção
   - Considerar adicionar autenticação/autorização nos endpoints do backend

## Próximos passos (opcional)

1. **Adicionar autenticação no backend:**
   - Validar JWT emitido pelo backend nos endpoints protegidos (se/ quando aplicável)
   - Proteger rotas sensíveis (criar mentor, criar booking)

2. **Deploy do backend:**
   - Vercel (serverless functions)
   - Heroku
   - Railway
   - DigitalOcean App Platform

3. **Melhorias:**
   - Validação de input com Zod no backend
   - Rate limiting
   - Logs estruturados
   - Health checks mais robustos

## Variáveis de ambiente

### Frontend (`.env` na raiz)
```
REMOVIDO: VITE_SUPABASE_* (não é mais usado)
VITE_API_BASE_URL="http://localhost:4000"
```

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://neondb_owner:npg_zwY1rFxad5AV@ep-snowy-dew-acxzaior-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=4000
```

## Migração concluída! 🎉

Todas as chamadas ao banco de dados e autenticação foram migradas para a API REST com JWT. Supabase foi completamente removido (código e envs).
