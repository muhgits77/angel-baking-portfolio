
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Bakes
CREATE TABLE public.bakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Pastries & Muffins',
  image_url TEXT NOT NULL,
  is_signature BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bakes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bakes TO authenticated;
GRANT ALL ON public.bakes TO service_role;
ALTER TABLE public.bakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bakes" ON public.bakes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert bakes" ON public.bakes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bakes" ON public.bakes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bakes" ON public.bakes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_bakes_updated_at BEFORE UPDATE ON public.bakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for bakes bucket (bucket created via tool)
CREATE POLICY "Public can view bake images" ON storage.objects
  FOR SELECT USING (bucket_id = 'bakes');

CREATE POLICY "Admins can upload bake images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bakes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bake images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'bakes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bake images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'bakes' AND public.has_role(auth.uid(), 'admin'));
