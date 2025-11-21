-- Migration: Fix RLS policies to ensure proper data isolation
-- File: supabase/migrations/06_fix_rls_security.sql

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA SEGURANÇA
-- ============================================

-- 1. SHIFTS - Garantir que usuários só vejam seus próprios plantões
-- (As políticas já estão corretas, mas vamos garantir)

-- 2. SHIFT_SWAPS - Corrigir política para mostrar apenas swaps próprios ou de amigos
DROP POLICY IF EXISTS "Users can view all open swaps" ON public.shift_swaps;

-- Nova política: usuários só veem seus próprios swaps ou swaps de amigos aceitos
CREATE POLICY "Users can view their own swaps or friends' swaps" ON public.shift_swaps
  FOR SELECT USING (
    auth.uid() = user_id OR
    (
      status = 'open' AND
      EXISTS (
        SELECT 1 FROM public.friends
        WHERE (
          (user_id = auth.uid() AND friend_id = shift_swaps.user_id) OR
          (friend_id = auth.uid() AND user_id = shift_swaps.user_id)
        )
        AND status = 'accepted'
      )
    )
  );

-- 3. WORK_RELATIONS - Garantir que políticas estão corretas
-- (Já estão corretas, mas vamos verificar)

-- 4. NOTIFICATIONS - Garantir que políticas estão corretas
-- (Já estão corretas)

-- 5. FRIENDS - Garantir que políticas estão corretas
-- (Já estão corretas)

-- 6. PROFILES - Adicionar política para permitir busca limitada (apenas para adicionar amigos)
-- Mas usuários só podem ver informações básicas de outros usuários (não dados sensíveis)
-- A política atual já está correta (só vê próprio perfil)

-- ============================================
-- COMENTÁRIOS DE SEGURANÇA
-- ============================================
-- IMPORTANTE: Todas as queries no código devem sempre filtrar por user_id
-- mesmo que o RLS esteja ativo, como camada adicional de segurança.
-- O RLS é a última linha de defesa, mas não devemos confiar apenas nele.

