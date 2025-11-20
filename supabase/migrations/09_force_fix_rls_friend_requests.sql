-- Migration: FORCE fix RLS policy for friend_requests
-- Execute esta migration se a 08 não funcionou
-- File: supabase/migrations/09_force_fix_rls_friend_requests.sql

-- Desabilitar RLS temporariamente para limpar tudo
ALTER TABLE public.friend_requests DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas usando DROP CASCADE
DO $$ 
DECLARE
  pol_name TEXT;
BEGIN
  -- Remover todas as políticas uma por uma
  FOR pol_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friend_requests'
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY %I ON public.friend_requests CASCADE', pol_name);
      RAISE NOTICE 'Política removida: %', pol_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política %: %', pol_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Criar políticas corretas do zero
CREATE POLICY "friend_requests_select_policy" ON public.friend_requests
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = from_user_id OR 
      auth.uid() = to_user_id
    )
  );

CREATE POLICY "friend_requests_insert_policy" ON public.friend_requests
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = from_user_id
  );

CREATE POLICY "friend_requests_update_policy" ON public.friend_requests
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = from_user_id OR 
      auth.uid() = to_user_id
    )
  );

CREATE POLICY "friend_requests_delete_policy" ON public.friend_requests
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = from_user_id OR 
      auth.uid() = to_user_id
    )
  );

-- Verificar resultado
DO $$
DECLARE
  pol_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pol_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'friend_requests';
  
  IF pol_count = 4 THEN
    RAISE NOTICE '✅ Sucesso! % políticas criadas corretamente', pol_count;
  ELSE
    RAISE WARNING '⚠️ Apenas % políticas encontradas (esperado: 4)', pol_count;
  END IF;
END $$;

