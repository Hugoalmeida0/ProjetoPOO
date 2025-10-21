-- Migração: permitir NULL na coluna senha da tabela profiles
-- Motivo: o trigger que cria automaticamente um registro em public.profiles ao criar auth.users não popula o campo "senha".
-- Se a coluna estiver NOT NULL, o INSERT disparado pelo trigger falha e impede o cadastro/login.

ALTER TABLE public.profiles
  ALTER COLUMN senha DROP NOT NULL;

-- Opcional: definir um valor padrão vazio caso prefira
-- ALTER TABLE public.profiles ALTER COLUMN senha SET DEFAULT '';
