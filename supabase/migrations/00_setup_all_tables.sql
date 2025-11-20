-- Migration Consolidada: Setup completo de todas as tabelas necessárias
-- Execute este arquivo se as migrations individuais não foram executadas
-- File: supabase/migrations/00_setup_all_tables.sql

-- ============================================
-- 1. GARANTIR EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. CRIAR TABELA FRIENDS (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

-- ============================================
-- 3. CRIAR TABELA FRIEND_REQUESTS (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_email text,
  invite_code text UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '30 days')
);

-- ============================================
-- 4. HABILITAR RLS
-- ============================================
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CRIAR POLÍTICAS RLS PARA FRIENDS
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friends' 
    AND policyname = 'Users can view their own friendships'
  ) THEN
    CREATE POLICY "Users can view their own friendships" ON public.friends
      FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friends' 
    AND policyname = 'Users can create friend requests'
  ) THEN
    CREATE POLICY "Users can create friend requests" ON public.friends
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friends' 
    AND policyname = 'Users can update their own friend requests'
  ) THEN
    CREATE POLICY "Users can update their own friend requests" ON public.friends
      FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friends' 
    AND policyname = 'Users can delete their own friendships'
  ) THEN
    CREATE POLICY "Users can delete their own friendships" ON public.friends
      FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);
  END IF;
END $$;

-- ============================================
-- 6. CRIAR POLÍTICAS RLS PARA FRIEND_REQUESTS
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friend_requests' 
    AND policyname = 'Users can view their own requests'
  ) THEN
    CREATE POLICY "Users can view their own requests" ON public.friend_requests
      FOR SELECT USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id
        -- Removido acesso a auth.users que causa erro de permissão
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friend_requests' 
    AND policyname = 'Users can create friend requests'
  ) THEN
    CREATE POLICY "Users can create friend requests" ON public.friend_requests
      FOR INSERT WITH CHECK (auth.uid() = from_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'friend_requests' 
    AND policyname = 'Users can update requests sent to them'
  ) THEN
    CREATE POLICY "Users can update requests sent to them" ON public.friend_requests
      FOR UPDATE USING (auth.uid() = to_user_id);
  END IF;
END $$;

-- ============================================
-- 7. CRIAR ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user ON public.friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON public.friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_email ON public.friend_requests(to_email);
CREATE INDEX IF NOT EXISTS idx_friend_requests_invite_code ON public.friend_requests(invite_code);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);

-- ============================================
-- 8. CRIAR FUNÇÕES
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. CRIAR TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_friends_updated_at ON public.friends;
CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON public.friends
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON public.friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

