
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Account status
CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'student',
  status account_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (for RLS helper)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user status helper
CREATE OR REPLACE FUNCTION public.get_profile_status(_user_id UUID)
RETURNS account_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Filieres (departments/programs)
CREATE TABLE public.filieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.filieres ENABLE ROW LEVEL SECURITY;

-- Groups (student groups within a filiere)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filiere_id UUID REFERENCES public.filieres(id) ON DELETE CASCADE NOT NULL,
  year INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Student details
CREATE TABLE public.student_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  matricule TEXT UNIQUE,
  filiere_id UUID REFERENCES public.filieres(id),
  group_id UUID REFERENCES public.groups(id),
  year INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

-- Teacher details
CREATE TABLE public.teacher_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  department TEXT,
  specialization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_details ENABLE ROW LEVEL SECURITY;

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  credits INT DEFAULT 3,
  semester INT DEFAULT 1,
  filiere_id UUID REFERENCES public.filieres(id),
  teacher_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Schedule entries
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  present BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, student_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Course materials
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Forums
CREATE TABLE public.forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  forum_type TEXT NOT NULL DEFAULT 'discussion',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;

-- Forum posts
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'),
    'pending'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS POLICIES

-- Profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- User roles: read own
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts roles" ON public.user_roles FOR INSERT WITH CHECK (true);

-- Filieres: everyone reads, admin manages
CREATE POLICY "Anyone can view filieres" ON public.filieres FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage filieres" ON public.filieres FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Groups: everyone reads, admin manages
CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage groups" ON public.groups FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Student details
CREATE POLICY "Students view own details" ON public.student_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all student details" ON public.student_details FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students insert own details" ON public.student_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage student details" ON public.student_details FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Teacher details
CREATE POLICY "Teachers view own details" ON public.teacher_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all teacher details" ON public.teacher_details FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers insert own details" ON public.teacher_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage teacher details" ON public.teacher_details FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Courses: authenticated users can view, teachers/admins manage
CREATE POLICY "Authenticated can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage own courses" ON public.courses FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Admins manage all courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Schedules: authenticated can view
CREATE POLICY "Authenticated can view schedules" ON public.schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage schedules" ON public.schedules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Attendance
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins manage attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Course materials
CREATE POLICY "Authenticated view materials" ON public.course_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage materials" ON public.course_materials FOR ALL USING (auth.uid() = uploaded_by);
CREATE POLICY "Admins manage materials" ON public.course_materials FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Forums
CREATE POLICY "Authenticated view forums" ON public.forums FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage forums" ON public.forums FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Admins manage forums" ON public.forums FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Forum posts
CREATE POLICY "Authenticated view posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own posts" ON public.forum_posts FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Admins manage all posts" ON public.forum_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
