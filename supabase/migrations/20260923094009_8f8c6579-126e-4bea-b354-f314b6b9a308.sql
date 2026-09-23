
CREATE TYPE public.app_role AS ENUM ('user','admin');
CREATE TYPE public.property_status AS ENUM ('available','reserved','sold');
CREATE TYPE public.request_status AS ENUM ('new','in_progress','done');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  beds INTEGER NOT NULL DEFAULT 0,
  area NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.property_status NOT NULL DEFAULT 'available',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  approved BOOLEAN NOT NULL DEFAULT false,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  status public.request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- roles policies
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- properties policies
CREATE POLICY "properties_public_read" ON public.properties FOR SELECT TO anon USING (approved = true);
CREATE POLICY "properties_auth_read" ON public.properties FOR SELECT TO authenticated USING (approved = true OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "properties_insert_own" ON public.properties FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND (approved = false OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "properties_update_own" ON public.properties FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND approved = false);
CREATE POLICY "properties_admin_update" ON public.properties FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "properties_delete_own" ON public.properties FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- requests policies
CREATE POLICY "requests_insert" ON public.requests FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "requests_select" ON public.requests FOR SELECT TO authenticated USING (
  client_id = auth.uid()
  OR public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.properties p WHERE p.id = requests.property_id AND p.owner_id = auth.uid())
);
CREATE POLICY "requests_admin_update" ON public.requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "requests_admin_delete" ON public.requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- new user handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;

INSERT INTO public.properties (name, description, district, city, property_type, price, beds, area, status, lat, lng, images, approved, sold_at) VALUES
('فيلا الياسمين الحديثة','فيلا عصرية بتشطيب فاخر وحديقة خاصة.','الياسمين','الرياض','villa',2350000,6,420,'available',24.8247,46.6395,'{}',true,NULL),
('شقة النرجس بانوراما','شقة بإطلالة مفتوحة قريبة من الخدمات.','النرجس','الرياض','apartment',890000,3,165,'reserved',24.8419,46.6575,'{}',true,NULL),
('دوبلكس الملقا','دوبلكس بمدخلين وموقف خاص.','الملقا','الرياض','duplex',1750000,5,320,'sold',24.7899,46.6183,'{}',true,now() - interval '20 days'),
('شقة حطين الفاخرة','شقة بتصميم مفتوح وإضاءة طبيعية.','حطين','الرياض','apartment',1180000,4,210,'available',24.7611,46.6114,'{}',true,NULL),
('فيلا الشاطئ الذهبي','فيلا على مقربة من الكورنيش.','الشاطئ','جدة','villa',3100000,7,510,'available',21.6212,39.1085,'{}',true,NULL),
('شقة الروضة المطلة','شقة عائلية في موقع حيوي.','الروضة','جدة','apartment',760000,3,150,'sold',21.5560,39.1720,'{}',true,now() - interval '45 days'),
('أرض تجارية الحمراء','أرض تجارية على شارعين.','الحمراء','جدة','land',4200000,0,900,'available',21.5169,39.1810,'{}',true,NULL),
('شقة الشاطئ الشرقي','شقة بإطلالة بحرية مباشرة.','الشاطئ','الدمام','apartment',980000,4,190,'reserved',26.4367,50.1050,'{}',true,NULL),
('فيلا الفيصلية','فيلا واسعة بحي هادئ.','الفيصلية','الدمام','villa',1890000,6,380,'available',26.3800,50.1220,'{}',true,NULL),
('مكتب إداري العليا','مكتب إداري جاهز في برج تجاري.','العليا','الرياض','office',1450000,0,240,'sold',24.6947,46.6853,'{}',true,now() - interval '8 days');
