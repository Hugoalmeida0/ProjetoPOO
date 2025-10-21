# Deploy na Vercel (Backend + Frontend)

## ✅ Configuração Completa

### 1. Adicionar Variáveis de Ambiente na Vercel

Acesse: **Dashboard da Vercel → Seu Projeto → Settings → Environment Variables**

Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://neondb_owner:npg_zwY1rFxad5AV@ep-snowy-dew-acxzaior-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=dev-secret-please-change

NODE_ENV=production
```

**IMPORTANTE:** Marque todas para Production, Preview e Development.

### 2. Deploy Automático

Após fazer push para o GitHub:

```bash
git add .
git commit -m "Configurar backend serverless na Vercel"
git push
```

A Vercel detecta automaticamente e faz o deploy.

### 3. Estrutura do Deploy

- **Frontend (SPA)**: `/` → Arquivos estáticos do Vite
- **Backend (Serverless)**: `/api/*` → Express como serverless functions
- **Rotas da API**:
  - `GET /api/health` → Status do servidor
  - `POST /api/auth/register` → Registro
  - `POST /api/auth/login` → Login
  - `GET /api/auth/me` → Usuário atual
  - `GET /api/graduations` → Cursos
  - `GET /api/subjects` → Matérias
  - `GET /api/mentors` → Mentores
  - Etc...

### 4. Testar Após Deploy

Abra seu app na Vercel e teste:

1. **Health check**: `https://seu-app.vercel.app/api/health`
   - Deve retornar: `{"status":"ok"}`

2. **Frontend**: `https://seu-app.vercel.app`
   - Deve carregar a página inicial

3. **Criar conta**: Vá em `/auth` e registre um usuário

### 5. Desenvolvimento Local

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
npm run dev
```

O arquivo `.env.local` garante que o frontend local use `http://localhost:4000`.

### 6. Como Funciona

- O Vite detecta automaticamente `.env.local` (dev) e `.env.production` (build)
- Em produção: `VITE_API_BASE_URL=/api` (mesmo domínio)
- Em dev: `VITE_API_BASE_URL=http://localhost:4000` (backend separado)

### 7. Troubleshooting

**Erro de conexão ao banco:**
- Verifique se `DATABASE_URL` está configurada corretamente na Vercel
- Verifique se o IP da Vercel está permitido no Neon (geralmente está)

**Erro 500 nas rotas da API:**
- Verifique os logs no Dashboard da Vercel → Functions
- Confirme que `NODE_ENV=production` está configurado

**Frontend não encontra a API:**
- Verifique se `VITE_API_BASE_URL` foi configurada
- Faça rebuild: Vercel → Deployments → ⋯ → Redeploy

