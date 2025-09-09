-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  senha TEXT NOT NULL, -- senha do usuario
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_mentor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create graduations table
CREATE TABLE public.graduations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  color TEXT,
  icon TEXT,
  students_count INTEGER DEFAULT 0,
  subjects_count INTEGER DEFAULT 0,
  mentors_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  graduation_id UUID NOT NULL REFERENCES public.graduations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  duration TEXT,
  mentors_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor_subjects junction table
CREATE TABLE public.mentor_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  UNIQUE(mentor_id, subject_id)
);

-- Create mentor_profiles table for additional mentor info
CREATE TABLE public.mentor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  graduation_id UUID REFERENCES public.graduations(id),
  price_per_hour DECIMAL(10,2),
  rating DECIMAL(2,1) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  location TEXT,
  availability TEXT,
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL,
  objective TEXT,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for graduations (public read)
CREATE POLICY "Anyone can view graduations" ON public.graduations FOR SELECT USING (true);

-- Create policies for subjects (public read)
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);

-- Create policies for mentor_subjects (public read)
CREATE POLICY "Anyone can view mentor subjects" ON public.mentor_subjects FOR SELECT USING (true);

-- Create policies for mentor_profiles
CREATE POLICY "Anyone can view mentor profiles" ON public.mentor_profiles FOR SELECT USING (true);
CREATE POLICY "Mentors can update their own profile" ON public.mentor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Mentors can insert their own profile" ON public.mentor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings as student" ON public.bookings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Mentors can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = mentor_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Mentors can update their bookings" ON public.bookings FOR UPDATE USING (auth.uid() = mentor_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_graduations_updated_at
  BEFORE UPDATE ON public.graduations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for graduations
INSERT INTO public.graduations (name, description, slug, color, icon, students_count, subjects_count, mentors_count) VALUES
('Ciência da Computação', 'Curso focado em programação, algoritmos e desenvolvimento de software', 'ciencia-computacao', 'from-blue-500 to-cyan-500', 'Code', 150, 12, 25),
('Engenharia Civil', 'Formação em construção, infraestrutura e gestão de obras', 'engenharia-civil', 'from-orange-500 to-red-500', 'Building', 120, 15, 18),
('Administração', 'Gestão empresarial, finanças e estratégias de negócio', 'administracao', 'from-green-500 to-emerald-500', 'TrendingUp', 200, 10, 30),
('Psicologia', 'Estudo do comportamento humano e processos mentais', 'psicologia', 'from-purple-500 to-pink-500', 'Brain', 90, 8, 15);

-- Insert sample subjects
INSERT INTO public.subjects (graduation_id, name, description, color, icon, duration, mentors_count, rating) VALUES
((SELECT id FROM public.graduations WHERE slug = 'ciencia-computacao'), 'Algoritmos e Estruturas de Dados', 'Fundamentos de programação e otimização', 'bg-blue-100 text-blue-800', 'Code', '2 semestres', 8, 4.8),
((SELECT id FROM public.graduations WHERE slug = 'ciencia-computacao'), 'Desenvolvimento Web', 'HTML, CSS, JavaScript e frameworks modernos', 'bg-green-100 text-green-800', 'Globe', '1 semestre', 12, 4.7),
((SELECT id FROM public.graduations WHERE slug = 'engenharia-civil'), 'Estruturas de Concreto', 'Cálculo e dimensionamento de estruturas', 'bg-orange-100 text-orange-800', 'Building', '2 semestres', 6, 4.6),
((SELECT id FROM public.graduations WHERE slug = 'administracao'), 'Gestão Financeira', 'Análise financeira e investimentos', 'bg-green-100 text-green-800', 'DollarSign', '1 semestre', 10, 4.9);