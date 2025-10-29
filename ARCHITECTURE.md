# 📐 Arquitetura Detalhada - UVV Mentor Connect

## 🏗️ Visão Geral da Arquitetura

O projeto segue uma arquitetura **Cliente-Servidor** com separação clara entre Frontend e Backend, comunicando-se via API REST.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React SPA (Single Page Application)           │ │
│  │  - Components (UI)                                         │ │
│  │  - Pages (Routes)                                          │ │
│  │  - Hooks (State Management)                                │ │
│  │  - Services (API Client)                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Node.js + Express)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Backend API                           │ │
│  │  - Routes (Endpoints)                                      │ │
│  │  - Middlewares (Auth, Validation)                          │ │
│  │  - Models (TypeScript Interfaces)                          │ │
│  │  - Config (Database, Environment)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (PostgreSQL)                   │
│  - Tables (users, bookings, ratings, etc.)                      │
│  - Relationships (Foreign Keys)                                 │
│  - Indexes (Performance)                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura Detalhada do Backend

```
backend/
├── src/
│   ├── config/              # Configurações e setup
│   │   └── db.ts           # Pool de conexão PostgreSQL
│   │
│   ├── middlewares/         # Middlewares Express
│   │   └── index.ts        # Auth, validation, error handling
│   │
│   ├── models/              # Definições de tipos/interfaces
│   │   └── index.ts        # User, Booking, Rating, etc.
│   │
│   ├── routes/              # Rotas/Controllers da API
│   │   ├── autenticacao.ts # POST /api/auth/login, /register
│   │   ├── usuarios.ts     # CRUD usuários
│   │   ├── perfis.ts       # Perfis de usuários
│   │   ├── mentores.ts     # CRUD mentores
│   │   ├── estudantes.ts   # CRUD estudantes
│   │   ├── graduacoes.ts   # CRUD graduações
│   │   ├── disciplinas.ts  # CRUD disciplinas
│   │   ├── mentor-disciplinas.ts  # Relação N:N
│   │   ├── agendamentos.ts # Sistema de bookings
│   │   ├── mensagens.ts    # Chat
│   │   ├── notificacoes.ts # Notificações
│   │   └── avaliacoes.ts   # Ratings
│   │
│   ├── bootstrap.ts         # Inicialização do schema do DB
│   ├── realtime.ts          # WebSocket features (futuro)
│   └── index.ts            # Entry point - Express app
│
├── dist/                    # Código TypeScript compilado
├── package.json
└── tsconfig.json
```

### Padrões de Rotas

Cada arquivo em `routes/` segue este padrão:

```typescript
import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { authMiddleware } from '../middlewares';

const router = Router();

// GET lista
router.get('/', async (req: Request, res: Response) => {
  // Lógica
});

// GET por ID
router.get('/:id', async (req: Request, res: Response) => {
  // Lógica
});

// POST criar
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  // Lógica
});

// PUT atualizar
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  // Lógica
});

// DELETE remover
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  // Lógica
});

export default router;
```

## 📁 Estrutura Detalhada do Frontend

```
src/
├── componentes/             # Componentes React
│   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── Cabecalho.tsx       # Header com navegação
│   ├── CardMentor.tsx      # Card de mentor
│   ├── CardDisciplina.tsx  # Card de disciplina
│   ├── ModalAvaliacao.tsx  # Modal de avaliação
│   └── ...
│
├── telas/                   # Páginas da aplicação
│   ├── Inicio.tsx          # Home page
│   ├── Autenticacao.tsx    # Login/Registro
│   ├── Mentores.tsx        # Lista de mentores
│   ├── DetalhesMentor.tsx  # Perfil do mentor
│   ├── AgendarMentoria.tsx # Formulário de agendamento
│   ├── MeusAgendamentos.tsx # Lista de bookings
│   ├── PainelMentor.tsx    # Dashboard do mentor
│   ├── Conta.tsx           # Configurações
│   └── ...
│
├── hooks/                   # Custom React Hooks
│   ├── useAutenticacao.tsx # Gerencia autenticação
│   ├── useMentores.tsx     # Fetching de mentores
│   ├── useAgendamentos.tsx # Gerencia bookings
│   ├── useNotificacoes.tsx # Sistema de notificações
│   └── ...
│
├── services/                # Comunicação com API
│   └── api.ts              # Cliente REST (fetch wrapper)
│
├── types/                   # TypeScript types/interfaces
│   └── index.ts            # User, Booking, Rating, etc.
│
├── utils/                   # Funções auxiliares
│   └── normalizeSubject.ts # Normalização de strings
│
├── lib/                     # Bibliotecas auxiliares
│   └── utils.ts            # cn() - classNames merge
│
├── assets/                  # Imagens, fontes, ícones
├── App.tsx                 # Componente raiz + Router
└── main.tsx                # Entry point React
```

### Padrão de Páginas

Cada página em `telas/` segue este padrão:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cabecalho from '@/componentes/Cabecalho';
import { Button } from '@/componentes/ui/button';
import { useAuth } from '@/hooks/useAutenticacao';

const PaginaExemplo = () => {
  const [data, setData] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar dados
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      <div className="container mx-auto px-4 py-8">
        {/* Conteúdo */}
      </div>
    </div>
  );
};

export default PaginaExemplo;
```

## 🔄 Fluxo de Dados

### 1. Autenticação

```
┌──────────┐      POST /api/auth/login      ┌──────────┐
│  Client  │ ──────────────────────────────> │   API    │
│          │  { email, password }            │          │
│          │                                 │          │
│          │ <────────────────────────────── │          │
│          │  { token, user }                │          │
└──────────┘                                 └──────────┘
     │                                             │
     │ Store token in localStorage                │
     │ Add token to API client                    │
     │                                             │
     │      GET /api/users/me                     │
     │      Authorization: Bearer {token}         │
     │ ──────────────────────────────────────────>│
     │                                             │
     │ <────────────────────────────────────────  │
     │      { user data }                         │
```

### 2. Agendamento de Mentoria

```
┌──────────┐                              ┌──────────┐
│ Estudante│                              │   API    │
└──────────┘                              └──────────┘
     │                                         │
     │  1. GET /api/mentors                   │
     │ ─────────────────────────────────────> │
     │ <───────────────────────────────────── │
     │    [lista de mentores]                 │
     │                                         │
     │  2. POST /api/bookings                 │
     │     { mentor_id, date, time, ... }     │
     │ ─────────────────────────────────────> │
     │                                         │
     │     [Cria booking com status pending]  │
     │     [Envia notificação ao mentor]      │
     │                                         │
     │ <───────────────────────────────────── │
     │    { booking created }                 │
     │                                         │
┌──────────┐                              ┌──────────┐
│  Mentor  │                              │   API    │
└──────────┘                              └──────────┘
     │                                         │
     │  3. GET /api/notifications             │
     │ ─────────────────────────────────────> │
     │ <───────────────────────────────────── │
     │    [notificação de novo agendamento]   │
     │                                         │
     │  4. PUT /api/bookings/:id              │
     │     { status: 'confirmed' }            │
     │ ─────────────────────────────────────> │
     │                                         │
     │     [Atualiza status]                  │
     │     [Envia notificação ao estudante]   │
     │                                         │
     │ <───────────────────────────────────── │
     │    { booking updated }                 │
```

## 🔐 Segurança

### JWT Authentication

1. **Login**: Cliente envia credenciais → API valida → Retorna JWT
2. **Requests**: Cliente inclui token no header `Authorization: Bearer {token}`
3. **Middleware**: API verifica token antes de processar requisição protegida
4. **Expiração**: Token expira após X horas (configurável)

### Validações

- **Frontend**: Validação de formulários com Zod + React Hook Form
- **Backend**: Validação de dados em cada rota
- **Banco**: Constraints, foreign keys, unique indexes

## 📊 Banco de Dados

### Principais Tabelas

```sql
users (id, email, password_hash, is_mentor, ...)
  ↓
profiles (user_id, full_name, bio, avatar_url, ...)
  ↓
mentor_profiles (user_id, experience_years, subjects, ...)
  ↓
mentor_subjects (mentor_id, subject_id) [N:N]
  ↓
bookings (id, student_id, mentor_id, date, time, status, ...)
  ↓
messages (id, booking_id, sender_id, content, ...)
  ↓
notifications (id, user_id, message, read, ...)
  ↓
ratings (id, booking_id, student_id, mentor_id, rating, ...)
```

### Relacionamentos

- **User 1:1 Profile**
- **User 1:1 MentorProfile** (se is_mentor = true)
- **Mentor N:N Subjects**
- **Booking N:1 Student (User)**
- **Booking N:1 Mentor (User)**
- **Booking 1:N Messages**
- **Booking 1:1 Rating**
- **User 1:N Notifications**

## 🚀 Performance

### Frontend
- **Code Splitting**: Lazy loading de rotas
- **Caching**: TanStack Query com cache inteligente
- **Otimização**: Vite build com tree-shaking
- **CDN**: Deploy na Vercel com edge caching

### Backend
- **Connection Pool**: Reutilização de conexões PostgreSQL
- **Indexes**: Indexes em colunas de busca frequente
- **Paginação**: Limitar resultados de queries grandes

## 📈 Escalabilidade

### Horizontal Scaling
- Frontend: Static files podem ser distribuídos em CDN
- Backend: Stateless API pode rodar em múltiplas instâncias
- Database: PostgreSQL com read replicas

### Vertical Scaling
- Aumentar recursos do servidor de banco de dados
- Otimizar queries com EXPLAIN ANALYZE

## 🔧 DevOps

### CI/CD
1. Push para GitHub
2. Vercel detecta mudanças
3. Build automático (frontend + backend)
4. Deploy em staging/production
5. Rollback automático em caso de erro

### Monitoring
- Logs de aplicação (console.log)
- Error tracking (futuro: Sentry)
- Performance monitoring (Vercel Analytics)

---

**Última atualização**: 29 de outubro de 2025
