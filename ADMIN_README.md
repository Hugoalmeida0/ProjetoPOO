# Painel Administrativo - UVV Mentor Connect

## 📋 Visão Geral

Foi implementado um painel administrativo completo para gerenciamento de usuários e mentorias no portal UVV Mentor Connect.

## 🔐 Acesso Administrativo

O painel administrativo está disponível **apenas** para usuários com credenciais de administrador:

- **Email**: `admin@gmail.com`
- **Senha**: `admin1234`

### Como acessar:

1. Faça login com as credenciais de administrador
2. Após autenticado, o link **"Admin"** aparecerá automaticamente na barra de navegação
3. Clique em **"Admin"** ou acesse diretamente `/admin`

## ✨ Funcionalidades

### 1️⃣ Aba "Usuários"

Exibe todos os usuários cadastrados no sistema com as seguintes informações:

- Nome completo
- Email
- Tipo (Mentor ou Estudante)
- Graduação (quando aplicável)
- Avaliação média e total de avaliações
- Telefone
- Data de cadastro

**Exportação**: Botão para download de planilha Excel com todos os dados dos usuários.

### 2️⃣ Aba "Mentorias"

Apresenta um relatório completo de todas as mentorias realizadas no portal:

- Data e hora da mentoria
- Informações do estudante (nome e email)
- Informações do mentor (nome e email)
- Matéria/disciplina
- Graduação
- Status da mentoria (Pendente, Confirmada, Em Andamento, Concluída, Cancelada)
- Avaliação (quando disponível)
- Duração em minutos

**Exportação**: Botão para download de planilha Excel com todos os dados das mentorias.

## 🛡️ Segurança

- Apenas usuários autenticados como administrador têm acesso ao painel
- Rotas protegidas no backend com middleware de autenticação e verificação de permissão admin
- Redirecionamento automático para a home se usuário não autorizado tentar acessar

## 🗂️ Arquivos Modificados/Criados

### Backend:
- ✅ **Criado**: `backend/src/routes/admin.ts` - Rotas administrativas
- 📝 **Modificado**: `backend/src/index.ts` - Registro da rota admin

### Frontend:
- ✅ **Criado**: `frontend/src/telas/Admin.tsx` - Tela administrativa
- ✅ **Criado**: `frontend/src/hooks/useAdmin.tsx` - Hook para dados administrativos
- 📝 **Modificado**: `frontend/src/hooks/useAutenticacao.tsx` - Adicionado campo `is_admin`
- 📝 **Modificado**: `frontend/src/services/api.ts` - Adicionadas rotas admin
- 📝 **Modificado**: `frontend/src/componentes/Cabecalho.tsx` - Link Admin na navbar
- 📝 **Modificado**: `frontend/src/App.tsx` - Rota `/admin`
- 📦 **Instalado**: `xlsx` - Biblioteca para exportação de planilhas Excel

## 📊 Exportação de Dados

As planilhas Excel exportadas incluem:

### Usuários:
- ID, Email, Nome Completo, É Mentor, Telefone, Localização
- Anos de Experiência, Avaliação Média, Total de Avaliações
- Graduação, Data de Cadastro

### Mentorias:
- ID, Data, Hora, Duração, Status
- Nome e Email do Estudante, Telefone do Estudante
- Nome e Email do Mentor
- Matéria, Graduação, Objetivo
- Motivo do Cancelamento (se aplicável)
- Avaliação e Comentário (se disponível)
- Datas de Criação e Atualização

## 🚀 Como Executar

1. **Backend**:
```bash
cd backend
npm install
npm run build
npm run dev
```

2. **Frontend**:
```bash
cd frontend
npm install
npm run build  # ou npm run dev para desenvolvimento
```

3. **Acessar**:
   - Faça login com `admin@gmail.com` / `admin1234`
   - Acesse o link "Admin" na navbar ou vá para `http://localhost:5173/admin`

## 📝 Notas Técnicas

- Interface responsiva com suporte mobile
- Componentes Shadcn/UI para interface consistente
- Abas para organização de dados (Usuários e Mentorias)
- Loading states durante carregamento de dados
- Toast notifications para feedback de erros
- Formatação de datas com `date-fns` em português (pt-BR)
- Badges coloridos para status de mentorias
- Exportação com colunas ajustadas automaticamente

## 🔄 Atualização dos Dados

Os dados são carregados automaticamente ao acessar a tela. Para atualizar:
- Recarregue a página (F5)
- Ou navegue para outra tela e volte ao painel admin

---

**Desenvolvido para UVV Mentor Connect** 🎓
