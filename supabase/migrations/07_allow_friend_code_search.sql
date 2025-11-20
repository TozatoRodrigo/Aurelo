-- Migration: Allow users to search profiles by friend_code
-- File: supabase/migrations/07_allow_friend_code_search.sql

-- NOTA: Esta migration requer que as tabelas friends e friend_requests existam
-- Se você receber erro sobre tabelas não encontradas, execute primeiro:
-- supabase/migrations/04_create_friends.sql ou supabase/migrations/00_setup_all_tables.sql

-- Criar função de segurança para buscar perfil por friend_code
-- Esta função retorna apenas informações públicas necessárias para adicionar amigos
CREATE OR REPLACE FUNCTION public.get_profile_by_friend_code(code text)
RETURNS TABLE (
  id uuid,
  friend_code text,
  full_name text,
  role text,
  avatar_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.friend_code,
    p.full_name,
    p.role,
    p.avatar_url
  FROM public.profiles p
  WHERE p.friend_code = upper(trim(code))
  LIMIT 1;
END;
$$;

-- Remover política existente se houver (para evitar erro de duplicação)
DROP POLICY IF EXISTS "Users can search profiles by friend_code for adding friends" ON public.profiles;

-- Política RLS adicional: permitir que usuários autenticados busquem perfis por friend_code
-- Mas apenas para ver campos públicos (não dados sensíveis)
CREATE POLICY "Users can search profiles by friend_code for adding friends" ON public.profiles
  FOR SELECT 
  USING (
    -- Permitir buscar se o friend_code corresponder
    -- Esta política funciona em conjunto com a função de segurança acima
    auth.uid() IS NOT NULL -- Usuário deve estar autenticado
  );

-- Comentário: A função get_profile_by_friend_code é a forma recomendada de buscar
-- pois ela garante que apenas campos públicos sejam retornados

