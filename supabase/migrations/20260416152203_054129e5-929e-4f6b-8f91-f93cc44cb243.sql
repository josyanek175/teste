
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;

-- Contacts: authenticated users can insert/update, admins can delete
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND status = 'ativo')
  );

CREATE POLICY "Authenticated users can update contacts" ON public.contacts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND status = 'ativo')
  );

CREATE POLICY "Admins can delete contacts" ON public.contacts
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Conversations: active users can insert/update
CREATE POLICY "Active users can insert conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND status = 'ativo')
  );

CREATE POLICY "Active users can update conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND status = 'ativo')
  );

-- Messages: active users can insert with their user_id
CREATE POLICY "Active users can insert messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND status = 'ativo')
    AND (user_id IS NULL OR user_id = auth.uid())
  );
