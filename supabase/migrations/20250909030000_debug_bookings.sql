-- Migração temporária para debug de agendamentos
-- Esta migração adiciona políticas mais permissivas para debug

-- Remover políticas existentes de bookings
DROP POLICY IF EXISTS "Users can view their own bookings as student" ON public.bookings;
DROP POLICY IF EXISTS "Mentors can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Mentors can update their bookings" ON public.bookings;

-- Criar políticas mais permissivas para debug
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);

-- Comentário: Estas políticas são temporárias para debug
-- Em produção, devem ser substituídas por políticas mais restritivas
