
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'atendente');

-- Create status enums
CREATE TYPE public.user_status AS ENUM ('ativo', 'inativo');
CREATE TYPE public.whatsapp_status AS ENUM ('conectado', 'desconectado');
CREATE TYPE public.conversation_status AS ENUM ('aberto', 'fechado');
CREATE TYPE public.message_type AS ENUM ('entrada', 'saida');

-- ══════════════════════════════════════
-- PROFILES
-- ══════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  status public.user_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════
-- USER ROLES (separate table per security best practices)
-- ══════════════════════════════════════
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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

-- ══════════════════════════════════════
-- WHATSAPP NUMBERS
-- ══════════════════════════════════════
CREATE TABLE public.whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  instance_name TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  status public.whatsapp_status NOT NULL DEFAULT 'desconectado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_numbers ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════
-- CONTACTS (CRM)
-- ══════════════════════════════════════
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL UNIQUE,
  email TEXT,
  ultima_interacao TIMESTAMPTZ,
  ultima_conversa TIMESTAMPTZ,
  ultimo_trabalho_data DATE,
  total_tentativas_sem_resposta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════
-- CONVERSATIONS
-- ══════════════════════════════════════
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  whatsapp_number_id UUID REFERENCES public.whatsapp_numbers(id) ON DELETE CASCADE NOT NULL,
  status public.conversation_status NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════
-- MESSAGES
-- ══════════════════════════════════════
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo public.message_type NOT NULL,
  conteudo TEXT NOT NULL,
  whatsapp_number_id UUID REFERENCES public.whatsapp_numbers(id) ON DELETE CASCADE NOT NULL,
  data_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════
-- TIMESTAMP TRIGGER
-- ══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_numbers_updated_at BEFORE UPDATE ON public.whatsapp_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  -- First user gets admin role, others get atendente
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'atendente');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════

-- Profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles: admins manage, users read own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- WhatsApp numbers: all authenticated can view, admins manage
CREATE POLICY "Authenticated users can view numbers" ON public.whatsapp_numbers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage numbers" ON public.whatsapp_numbers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Contacts: all authenticated can view and manage
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts" ON public.contacts
  FOR UPDATE TO authenticated
  USING (true);

-- Conversations: all authenticated can view and manage
CREATE POLICY "Authenticated users can view conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING (true);

-- Messages: all authenticated can view, insert with user_id
CREATE POLICY "Authenticated users can view messages" ON public.messages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ══════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════
CREATE INDEX idx_contacts_telefone ON public.contacts(telefone);
CREATE INDEX idx_contacts_ultima_interacao ON public.contacts(ultima_interacao);
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_conversations_whatsapp_number_id ON public.conversations(whatsapp_number_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_data_envio ON public.messages(data_envio);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
