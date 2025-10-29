# 🎓 UVV Mentor Connect

> Plataforma de mentorias acadêmicas da Universidade Vila Velha (UVV) que conecta estudantes a mentores qualificados para aprimoramento do desempenho acadêmico através de sessões personalizadas de orientação e apoio educacional.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 📋 Sobre o Projeto

O **UVV Mentor Connect** é uma plataforma web desenvolvida para facilitar o processo de mentorias acadêmicas na Universidade Vila Velha. O sistema permite que estudantes encontrem mentores especializados em diferentes disciplinas e graduações, agendando sessões de mentoria de forma intuitiva e eficiente.

### ✨ Funcionalidades Principais

- 🔍 **Busca de Mentores**: Filtros por disciplina, graduação e avaliações
- 📅 **Agendamento de Mentorias**: Sistema completo de reservas com confirmação
- 🔔 **Notificações em Tempo Real**: Alertas sobre status de agendamentos
- ⭐ **Sistema de Avaliações**: Avaliações únicas e controladas após mentorias
- 💬 **Chat Integrado**: Comunicação direta entre mentor e mentorado
- 👤 **Perfis Personalizados**: Gerenciamento de perfis de estudantes e mentores
- 📊 **Painel do Mentor**: Dashboard com estatísticas e gerenciamento de sessões
- 🎯 **Especialidades Normalizadas**: Sistema inteligente de autocomplete para disciplinas

### 🎯 Regras de Negócio

- ✅ Notificações automáticas para todas as mudanças de status (pending, confirmed, in-progress, completed, cancelled)
- ✅ Controle de avaliação única (cada mentoria só pode ser avaliada uma vez)
- ✅ Validação: só é possível finalizar mentorias previamente confirmadas
- ✅ Prevenção de auto-agendamento (usuário não pode agendar consigo mesmo)
- ✅ Sistema de normalização de disciplinas (previne duplicatas)

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server de alta performance
- **React Router DOM v6** - Roteamento de páginas SPA
- **TanStack Query (React Query)** - Gerenciamento de estado assíncrono e cache
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes React acessíveis e customizáveis
- **Radix UI** - Primitivos de UI acessíveis
- **Lucide React** - Biblioteca de ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas TypeScript-first
- **date-fns** - Manipulação de datas

### **Backend**
- **Node.js** - Runtime JavaScript server-side
- **Express.js** - Framework web minimalista
- **TypeScript** - Tipagem estática para Node.js
- **PostgreSQL** - Banco de dados relacional
- **pg (node-postgres)** - Cliente PostgreSQL para Node.js
- **JWT (jsonwebtoken)** - Autenticação baseada em tokens
- **CORS** - Middleware para habilitar CORS
- **dotenv** - Gerenciamento de variáveis de ambiente
- **ts-node-dev** - Execução TypeScript com hot-reload

### **Infraestrutura**
- **Vercel** - Hospedagem e deploy do frontend
- **Neon Database** - PostgreSQL serverless (banco de dados em nuvem)
- **Git & GitHub** - Controle de versão e repositório
- **ESLint** - Linter JavaScript/TypeScript
- **Vitest** - Framework de testes unitários

## 📂 Arquitetura do Projeto

```
projeto-poo/
├── backend/                      # Servidor Node.js + Express
│   ├── src/
│   │   ├── rotas/               # Rotas/Controllers da API
│   │   │   ├── autenticacao.ts  # Autenticação (login/registro)
│   │   │   ├── usuarios.ts      # CRUD de usuários
│   │   │   ├── perfis.ts        # Perfis de usuários
│   │   │   ├── estudantes.ts    # Gerenciamento de estudantes
│   │   │   ├── mentores.ts      # Gerenciamento de mentores
│   │   │   ├── mentor-disciplinas.ts  # Relação mentor-disciplinas
│   │   │   ├── disciplinas.ts   # CRUD de disciplinas
│   │   │   ├── graduacoes.ts    # CRUD de graduações
│   │   │   ├── agendamentos.ts  # Sistema de bookings
│   │   │   ├── mensagens.ts     # Chat entre usuários
│   │   │   ├── notificacoes.ts  # Sistema de notificações
│   │   │   └── avaliacoes.ts    # Avaliações de mentorias
│   │   ├── db.ts                # Configuração PostgreSQL
│   │   ├── bootstrap.ts         # Inicialização do banco
│   │   ├── realtime.ts          # WebSocket/Realtime features
│   │   └── index.ts             # Entry point do servidor
│   ├── dist/                    # Código compilado JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                     # Variáveis de ambiente (DATABASE_URL, JWT_SECRET)
│
├── frontend/ (root src/)         # Aplicação React
│   ├── src/
│   │   ├── componentes/         # Componentes React reutilizáveis
│   │   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   ├── Cabecalho.tsx    # Header com navegação
│   │   │   ├── CardMentor.tsx   # Card de exibição de mentor
│   │   │   ├── CardDisciplina.tsx
│   │   │   ├── CardGraduacao.tsx
│   │   │   ├── ModalAvaliacao.tsx  # Modal de avaliação
│   │   │   ├── DialogoChat.tsx  # Chat de mensagens
│   │   │   └── ...
│   │   ├── telas/               # Páginas/Views da aplicação
│   │   │   ├── Inicio.tsx       # Página inicial
│   │   │   ├── Autenticacao.tsx # Login/Registro
│   │   │   ├── Mentores.tsx     # Lista de mentores
│   │   │   ├── DetalhesMentor.tsx
│   │   │   ├── Estudantes.tsx
│   │   │   ├── AgendarMentoria.tsx
│   │   │   ├── MeusAgendamentos.tsx
│   │   │   ├── PainelMentor.tsx # Dashboard do mentor
│   │   │   ├── TornarSeMentor.tsx
│   │   │   ├── Conta.tsx        # Configurações de conta
│   │   │   ├── SaibaMais.tsx
│   │   │   ├── DetalhesGraduacao.tsx
│   │   │   └── NaoEncontrado.tsx
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
