-- Criar um usuário mentor de teste
-- Este usuário será usado para testes de agendamento

-- Inserir usuário mentor de teste na tabela auth.users
-- Nota: Em produção, usuários são criados através do sistema de autenticação
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mentor.teste@uvv.br',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Mentor Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Inserir perfil do mentor de teste
INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    is_mentor,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Mentor Teste',
    'mentor.teste@uvv.br',
    true,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Inserir perfil de mentor específico
INSERT INTO public.mentor_profiles (
    user_id,
    graduation_id,
    price_per_hour,
    rating,
    total_sessions,
    location,
    availability,
    experience_years,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.graduations WHERE slug = 'ciencia-computacao' LIMIT 1),
    0.00,
    4.8,
    0,
    'UVV - Campus Boa Vista',
    'Segunda a Sexta, 14h às 18h',
    2,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;
