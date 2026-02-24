
-- Fix permissive INSERT policies
DROP POLICY "System can insert profiles" ON public.profiles;
DROP POLICY "System inserts roles" ON public.user_roles;

-- Only allow inserting own profile/roles (trigger runs as SECURITY DEFINER so it bypasses RLS)
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
