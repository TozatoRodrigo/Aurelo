-- Migration: Fix RLS policy for friend_requests to remove auth.users access
-- File: supabase/migrations/08_fix_friend_requests_rls.sql

-- FORÇAR remoção de TODAS as políticas de friend_requests
DO $$ 
DECLARE
  pol_record RECORD;
  sql_stmt TEXT;
BEGIN
  -- Buscar e remover todas as políticas
  FOR pol_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friend_requests'
  LOOP
    sql_stmt := format('DROP POLICY IF EXISTS %I ON public.friend_requests', pol_record.policyname);
    EXECUTE sql_stmt;
    RAISE NOTICE 'Política removida: %', pol_record.policyname;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao remover políticas (continuando): %', SQLERRM;
END $$;

-- Aguardar um pouco para garantir que as políticas foram removidas
DO $$ BEGIN
  PERFORM pg_sleep(0.1);
END $$;

-- Criar políticas corretas SEM acesso a auth.users
-- Política de SELECT: usuários podem ver suas próprias solicitações
CREATE POLICY "Users can view their own requests" ON public.friend_requests
  FOR SELECT USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
  );

-- Política de INSERT: usuários podem criar solicitações como remetentes
CREATE POLICY "Users can create friend requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Política de UPDATE: usuários podem atualizar solicitações enviadas a eles
CREATE POLICY "Users can update requests sent to them" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Política de DELETE: usuários podem deletar suas próprias solicitações
CREATE POLICY "Users can delete their own requests" ON public.friend_requests
  FOR DELETE USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
  );

-- Verificar se as políticas foram criadas corretamente
DO $$
DECLARE
  pol_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pol_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'friend_requests';
  
  RAISE NOTICE 'Total de políticas criadas para friend_requests: %', pol_count;
END $$;
