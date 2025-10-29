# 🎓 UVV Mentor Connect# 🎓 UVV Mentor Connect



## 📋 Descrição## 📋 Descrição



Plataforma de mentorias acadêmicas da Universidade Vila Velha (UVV) que conecta estudantes a mentores qualificados para aprimoramento do desempenho acadêmico através de sessões personalizadas de orientação e apoio educacional.Plataforma de mentorias acadêmicas da Universidade Vila Velha (UVV) que conecta estudantes a mentores qualificados para aprimoramento do desempenho acadêmico através de sessões personalizadas de orientação e apoio educacional.



## 🚀 Tecnologias Utilizadas## 🚀 Tecnologias Utilizadas



### **Front-end**### **Front-end**

- React 18- React 18

- TypeScript- TypeScript

- Vite- Vite

- React Router DOM v6- React Router DOM v6

- TanStack Query (React Query)- TanStack Query (React Query)

- Tailwind CSS- Tailwind CSS

- Shadcn/ui- Shadcn/ui

- Radix UI- Radix UI

- Lucide React- Lucide React

- React Hook Form- React Hook Form

- Zod- Zod

- date-fns- date-fns



### **Back-end**### **Back-end**

- Node.js- Node.js

- Express.js- Express.js

- TypeScript- TypeScript

- PostgreSQL- PostgreSQL

- pg (node-postgres)- pg (node-postgres)

- JWT (jsonwebtoken)- JWT (jsonwebtoken)

- CORS- CORS

- dotenv- dotenv



### **Infraestrutura**### **Infraestrutura**

- Vercel (Hospedagem Frontend)- Vercel (Hospedagem Frontend)

- Neon Database (PostgreSQL Serverless)- Neon Database (PostgreSQL Serverless)

- Git & GitHub- Git & GitHub

- ESLint- ESLint

- Vitest- Vitest



## 📂 Arquitetura do Projeto## 📂 Arquitetura do Projeto



``````

uvv-mentor-connect/projeto-poo/

├── backend/                      # Servidor Node.js + Express├── backend/                      # Servidor Node.js + Express

│   ├── src/│   ├── src/

│   │   ├── config/              # Configurações (database)│   │   ├── rotas/               # Rotas/Controllers da API

│   │   ├── middlewares/         # Middlewares Express│   │   │   ├── autenticacao.ts  # Autenticação (login/registro)

│   │   ├── models/              # Interfaces TypeScript│   │   │   ├── usuarios.ts      # CRUD de usuários

│   │   ├── routes/              # Rotas/Controllers da API│   │   │   ├── perfis.ts        # Perfis de usuários

│   │   │   ├── autenticacao.ts│   │   │   ├── estudantes.ts    # Gerenciamento de estudantes

│   │   │   ├── usuarios.ts│   │   │   ├── mentores.ts      # Gerenciamento de mentores

│   │   │   ├── perfis.ts│   │   │   ├── mentor-disciplinas.ts  # Relação mentor-disciplinas

│   │   │   ├── mentores.ts│   │   │   ├── disciplinas.ts   # CRUD de disciplinas

│   │   │   ├── estudantes.ts│   │   │   ├── graduacoes.ts    # CRUD de graduações

│   │   │   ├── disciplinas.ts│   │   │   ├── agendamentos.ts  # Sistema de bookings

│   │   │   ├── graduacoes.ts│   │   │   ├── mensagens.ts     # Chat entre usuários

│   │   │   ├── agendamentos.ts│   │   │   ├── notificacoes.ts  # Sistema de notificações

│   │   │   ├── mensagens.ts│   │   │   └── avaliacoes.ts    # Avaliações de mentorias

│   │   │   ├── notificacoes.ts│   │   ├── db.ts                # Configuração PostgreSQL

│   │   │   └── avaliacoes.ts│   │   ├── bootstrap.ts         # Inicialização do banco

│   │   ├── bootstrap.ts         # Inicialização do banco│   │   ├── realtime.ts          # WebSocket/Realtime features

│   │   └── index.ts             # Entry point│   │   └── index.ts             # Entry point do servidor

│   ├── package.json│   ├── dist/                    # Código compilado JavaScript

│   └── tsconfig.json│   ├── package.json

││   ├── tsconfig.json

├── frontend/                     # Aplicação React│   └── .env                     # Variáveis de ambiente (DATABASE_URL, JWT_SECRET)

│   ├── src/│

│   │   ├── componentes/         # Componentes React├── frontend/ (root src/)         # Aplicação React

│   │   │   ├── ui/              # Componentes base (shadcn/ui)│   ├── src/

│   │   │   ├── Cabecalho.tsx│   │   ├── componentes/         # Componentes React reutilizáveis

│   │   │   ├── CardMentor.tsx│   │   │   ├── ui/              # Componentes base (shadcn/ui)

│   │   │   ├── ModalAvaliacao.tsx│   │   │   │   ├── button.tsx

│   │   │   └── ...│   │   │   │   ├── card.tsx

│   │   ├── telas/               # Páginas da aplicação│   │   │   │   ├── dialog.tsx

│   │   │   ├── Inicio.tsx│   │   │   │   ├── input.tsx

│   │   │   ├── Autenticacao.tsx│   │   │   │   └── ...

│   │   │   ├── Mentores.tsx│   │   │   ├── Cabecalho.tsx    # Header com navegação

│   │   │   ├── AgendarMentoria.tsx│   │   │   ├── CardMentor.tsx   # Card de exibição de mentor

│   │   │   ├── MeusAgendamentos.tsx│   │   │   ├── CardDisciplina.tsx

│   │   │   ├── PainelMentor.tsx│   │   │   ├── CardGraduacao.tsx

│   │   │   └── ...│   │   │   ├── ModalAvaliacao.tsx  # Modal de avaliação

│   │   ├── hooks/               # Custom React Hooks│   │   │   ├── DialogoChat.tsx  # Chat de mensagens

│   │   ├── services/            # API client│   │   │   └── ...

│   │   ├── types/               # TypeScript interfaces│   │   ├── telas/               # Páginas/Views da aplicação

│   │   ├── utils/               # Funções auxiliares│   │   │   ├── Inicio.tsx       # Página inicial

│   │   ├── lib/                 # Bibliotecas auxiliares│   │   │   ├── Autenticacao.tsx # Login/Registro

│   │   └── assets/              # Imagens e ícones│   │   │   ├── Mentores.tsx     # Lista de mentores

│   ├── public/│   │   │   ├── DetalhesMentor.tsx

│   ├── index.html│   │   │   ├── Estudantes.tsx

│   ├── package.json│   │   │   ├── AgendarMentoria.tsx

│   ├── vite.config.ts│   │   │   ├── MeusAgendamentos.tsx

│   └── tsconfig.json│   │   │   ├── PainelMentor.tsx # Dashboard do mentor

││   │   │   ├── TornarSeMentor.tsx

├── .gitignore│   │   │   ├── Conta.tsx        # Configurações de conta

├── package.json                  # Scripts principais do projeto│   │   │   ├── SaibaMais.tsx

└── README.md│   │   │   ├── DetalhesGraduacao.tsx

```│   │   │   └── NaoEncontrado.tsx

│   │   ├── hooks/               # Custom React Hooks
│   │   │   ├── useAutenticacao.tsx
│   │   │   ├── useMentores.tsx
│   │   │   ├── useEstudantes.tsx
│   │   │   ├── useAgendamentos.tsx
│   │   │   ├── useNotificacoes.tsx
│   │   │   ├── useMensagens.tsx
│   │   │   ├── useDisciplinas.tsx
│   │   │   ├── useGraduacoes.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── use-mobile.tsx
│   │   ├── integracoes/         # Serviços externos
│   │   │   └── api/
│   │   │       └── client.ts    # Cliente API REST (fetch wrapper)
│   │   ├── lib/                 # Utilitários e helpers
│   │   │   ├── utils.ts         # Funções auxiliares (cn, etc)
│   │   │   └── normalizeSubject.ts  # Normalização de disciplinas
│   │   ├── assets/              # Imagens, fontes, ícones
│   │   ├── App.tsx              # Componente raiz
│   │   ├── main.tsx             # Entry point React
│   │   ├── index.css            # Estilos globais
│   │   └── App.css
│   ├── public/                  # Assets estáticos
│   │   ├── favicon.ico
│   │   ├── site.webmanifest     # PWA manifest
│   │   └── robots.txt
│   ├── dist/                    # Build de produção
│   ├── index.html               # HTML template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts           # Configuração Vite
│   ├── tailwind.config.ts       # Configuração Tailwind
│   ├── postcss.config.js
│   ├── components.json          # Configuração shadcn/ui
│   └── .env.local               # Variáveis de ambiente frontend
│
├── .gitignore
├── .env                          # Variáveis de ambiente globais
├── vercel.json                   # Configuração de deploy Vercel
├── BUSINESS_RULES.md             # Documentação de regras de negócio
├── FAVICON_INSTRUCTIONS.md       # Instruções para favicon
└── README.md                     # Este arquivo

```

## 🗄️ Modelo de Dados

### Principais Entidades

- **users** - Usuários do sistema (estudantes e mentores)
- **profiles** - Perfis complementares dos usuários
- **mentor_profiles** - Dados específicos de mentores (experiência, especialidades)
- **subjects** - Disciplinas/Matérias
- **graduations** - Cursos de graduação
- **mentor_subjects** - Relação N:N entre mentores e disciplinas
- **bookings** - Agendamentos de mentorias
- **messages** - Mensagens do chat
- **notifications** - Notificações do sistema
- **ratings** - Avaliações de mentorias

### Fluxo de Status de Mentoria

```
PENDING (pendente) 
   ↓ [Mentor confirma]
CONFIRMED (confirmada)
   ↓ [Mentoria inicia]
IN-PROGRESS (em andamento)
   ↓ [Mentoria termina]
COMPLETED (finalizada)
   ↓ [Estudante avalia]
RATED (avaliada)
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ (ou acesso ao Neon Database)
- npm ou yarn

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/Hugoalmeida0/ProjetoPOO.git
cd ProjetoPOO
```

### 2️⃣ Configurar Variáveis de Ambiente

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
NODE_ENV=development
```

**Frontend** (`.env.local`):
```env
VITE_API_BASE_URL=http://localhost:4000
```

### 3️⃣ Instalar Dependências

```bash
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

### 4️⃣ Configurar Banco de Dados

Execute o script de criação de tabelas no PostgreSQL:

```sql
-- Consulte o arquivo backend/src/bootstrap.ts para o schema completo
```

### 5️⃣ Executar em Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor rodando em http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Aplicação rodando em http://localhost:5173
```

### 6️⃣ Build de Produção

```bash
# Build completo (backend + frontend)
npm run build

# Apenas backend
npm run build:backend

# Preview do build
npm run preview
```

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes com coverage
npm run test:coverage
```

## 🚀 Deploy

### Vercel (Frontend + Backend Serverless)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push na branch `main`

**Variáveis de Ambiente Necessárias:**
- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_API_BASE_URL`

### Backend Standalone (Alternativa)

```bash
cd backend
npm run build
npm start
```

## 📱 Progressive Web App (PWA)

O projeto está configurado como PWA com:
- ✅ Service Worker
- ✅ Manifest (`public/site.webmanifest`)
- ✅ Ícones em múltiplos tamanhos
- ✅ Instalável em dispositivos móveis

## 🎨 Padrões de Código

### Naming Conventions
- **Componentes**: PascalCase (`CardMentor.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAutenticacao.tsx`)
- **Utilitários**: camelCase (`normalizeSubject.ts`)
- **Rotas Backend**: kebab-case ou camelCase (`mentor-disciplinas.ts`)

### Estrutura de Componentes
```tsx
// Imports
import { useState } from 'react';
import { Button } from '@/componentes/ui/button';

// Interfaces/Types
interface ComponentProps {
  title: string;
}

// Componente
export const Component = ({ title }: ComponentProps) => {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handleClick = () => {};
  
  // Render
  return <div>{title}</div>;
};
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido como trabalho acadêmico da Universidade Vila Velha (UVV).

## 👥 Autores

- **Hugo Almeida** - Desenvolvedor Full Stack - [@Hugoalmeida0](https://github.com/Hugoalmeida0)

## 📞 Contato

- GitHub: [@Hugoalmeida0](https://github.com/Hugoalmeida0)
- Projeto: [https://github.com/Hugoalmeida0/ProjetoPOO](https://github.com/Hugoalmeida0/ProjetoPOO)

## 🙏 Agradecimentos

- Universidade Vila Velha (UVV)
- Shadcn/ui por componentes incríveis
- Comunidade React e Node.js

---

**Desenvolvido com ❤️ na UVV**
