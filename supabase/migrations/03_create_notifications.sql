-- Migration: Create notifications table
-- File: supabase/migrations/03_create_notifications.sql

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- NOTIFICATIONS table
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('reminder', 'swap_match', 'swap_interest', 'burnout_alert', 'goal_achieved')),
  title text not null,
  message text not null,
  link text,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- RLS Policies
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notifications" on public.notifications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- Indexes for performance
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);
create index idx_notifications_created_at on public.notifications(created_at desc);
create index idx_notifications_type on public.notifications(type);

-- Function to clean old notifications (older than 30 days)
create or replace function clean_old_notifications()
returns void as $$
begin
  delete from public.notifications
  where created_at < now() - interval '30 days'
  and read = true;
end;
$$ language plpgsql security definer;

