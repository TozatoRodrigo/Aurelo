-- Migration: Create shift_swaps and swap_interests tables
-- File: supabase/migrations/02_create_shift_swaps.sql

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- SHIFT SWAPS table
create table public.shift_swaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  shift_id uuid references public.shifts(id) on delete set null,
  swap_type text not null check (swap_type in ('offer', 'request', 'exchange')),
  desired_date timestamp with time zone,
  desired_institution_id uuid references public.work_relations(id) on delete set null,
  status text default 'open' check (status in ('open', 'matched', 'completed', 'cancelled')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SWAP INTERESTS table
create table public.swap_interests (
  id uuid primary key default uuid_generate_v4(),
  swap_id uuid references public.shift_swaps(id) on delete cascade not null,
  interested_user_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(swap_id, interested_user_id) -- Prevent duplicate interests
);

-- Enable RLS
alter table public.shift_swaps enable row level security;
alter table public.swap_interests enable row level security;

-- RLS Policies for shift_swaps
create policy "Users can view all open swaps" on public.shift_swaps
  for select using (status = 'open' OR auth.uid() = user_id);

create policy "Users can create their own swaps" on public.shift_swaps
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own swaps" on public.shift_swaps
  for update using (auth.uid() = user_id);

create policy "Users can delete their own swaps" on public.shift_swaps
  for delete using (auth.uid() = user_id);

-- RLS Policies for swap_interests
create policy "Users can view interests on their swaps" on public.swap_interests
  for select using (
    auth.uid() = interested_user_id OR 
    auth.uid() = (select user_id from public.shift_swaps where id = swap_id)
  );

create policy "Users can create interests" on public.swap_interests
  for insert with check (auth.uid() = interested_user_id);

create policy "Swap owners can update interests" on public.swap_interests
  for update using (
    auth.uid() = (select user_id from public.shift_swaps where id = swap_id)
  );

create policy "Users can delete their own interests" on public.swap_interests
  for delete using (auth.uid() = interested_user_id);

-- Indexes for performance
create index idx_shift_swaps_user_id on public.shift_swaps(user_id);
create index idx_shift_swaps_status on public.shift_swaps(status);
create index idx_shift_swaps_swap_type on public.shift_swaps(swap_type);
create index idx_swap_interests_swap_id on public.swap_interests(swap_id);
create index idx_swap_interests_user_id on public.swap_interests(interested_user_id);
create index idx_swap_interests_status on public.swap_interests(status);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_shift_swaps_updated_at
  before update on public.shift_swaps
  for each row execute procedure update_updated_at_column();

create trigger update_swap_interests_updated_at
  before update on public.swap_interests
  for each row execute procedure update_updated_at_column();

