-- Migration: Add friend_code to profiles
-- File: supabase/migrations/05_add_friend_code_to_profiles.sql

-- Garantir que a função generate_invite_code existe
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Adicionar coluna friend_code se não existir
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS friend_code text;

-- Popular friend_code para perfis existentes que não têm código
UPDATE public.profiles
SET friend_code = public.generate_invite_code()
WHERE friend_code IS NULL OR friend_code = '';

-- Remover constraint de unique se existir (para poder recriar)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_friend_code_key'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_friend_code_key;
  END IF;
END $$;

-- Garantir que todos os perfis tenham um código único
-- Se houver duplicatas, regenerar
DO $$
DECLARE
  rec RECORD;
  new_code text;
BEGIN
  FOR rec IN 
    SELECT id, friend_code 
    FROM public.profiles 
    WHERE friend_code IS NULL 
       OR friend_code = ''
       OR id IN (
         SELECT id FROM (
           SELECT id, ROW_NUMBER() OVER (PARTITION BY friend_code ORDER BY created_at) as rn
           FROM public.profiles
           WHERE friend_code IS NOT NULL
         ) t WHERE rn > 1
       )
  LOOP
    LOOP
      new_code := public.generate_invite_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE friend_code = new_code
      );
    END LOOP;
    
    UPDATE public.profiles
    SET friend_code = new_code
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Agora definir como NOT NULL e adicionar constraint unique
ALTER TABLE public.profiles
  ALTER COLUMN friend_code SET NOT NULL,
  ALTER COLUMN friend_code SET DEFAULT public.generate_invite_code();

-- Adicionar constraint unique
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_friend_code_key UNIQUE (friend_code);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON public.profiles(friend_code);
