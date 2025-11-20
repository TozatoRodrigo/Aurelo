-- Add preferences columns to profiles
alter table public.profiles 
add column if not exists monthly_goal numeric,
add column if not exists weekly_hours_limit numeric;

