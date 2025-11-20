-- Migration: Create friends and friend_requests tables
-- File: supabase/migrations/04_create_friends.sql

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- FRIENDS table (bidirectional friendship)
create table public.friends (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id),
  check(user_id != friend_id) -- Prevent self-friendship
);

-- FRIEND REQUESTS table (for tracking invitations)
create table public.friend_requests (
  id uuid primary key default uuid_generate_v4(),
  from_user_id uuid references public.profiles(id) on delete cascade not null,
  to_user_id uuid references public.profiles(id) on delete cascade,
  to_email text, -- For inviting users not yet registered
  invite_code text unique, -- Unique code for email invitations
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '30 days')
);

-- Enable RLS
alter table public.friends enable row level security;
alter table public.friend_requests enable row level security;

-- RLS Policies for friends
create policy "Users can view their own friendships" on public.friends
  for select using (auth.uid() = user_id OR auth.uid() = friend_id);

create policy "Users can create friend requests" on public.friends
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own friend requests" on public.friends
  for update using (auth.uid() = user_id OR auth.uid() = friend_id);

create policy "Users can delete their own friendships" on public.friends
  for delete using (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for friend_requests
create policy "Users can view their own requests" on public.friend_requests
  for select using (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
    -- Removido acesso a auth.users que causa erro de permissão
  );

create policy "Users can create friend requests" on public.friend_requests
  for insert with check (auth.uid() = from_user_id);

create policy "Users can update requests sent to them" on public.friend_requests
  for update using (auth.uid() = to_user_id);

-- Indexes for performance
create index idx_friends_user_id on public.friends(user_id);
create index idx_friends_friend_id on public.friends(friend_id);
create index idx_friends_status on public.friends(status);
create index idx_friend_requests_from_user on public.friend_requests(from_user_id);
create index idx_friend_requests_to_user on public.friend_requests(to_user_id);
create index idx_friend_requests_to_email on public.friend_requests(to_email);
create index idx_friend_requests_invite_code on public.friend_requests(invite_code);
create index idx_friend_requests_status on public.friend_requests(status);

-- Function to generate invite code
create or replace function generate_invite_code()
returns text as $$
begin
  return upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
end;
$$ language plpgsql;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_friends_updated_at
  before update on public.friends
  for each row execute procedure update_updated_at_column();

create trigger update_friend_requests_updated_at
  before update on public.friend_requests
  for each row execute procedure update_updated_at_column();

-- Function to automatically create bidirectional friendship when accepted
create or replace function create_bidirectional_friendship()
returns trigger as $$
begin
  -- When a friend request is accepted, create the reverse friendship
  if new.status = 'accepted' and old.status = 'pending' then
    -- Check if reverse friendship doesn't exist
    if not exists (
      select 1 from public.friends 
      where user_id = new.friend_id and friend_id = new.user_id
    ) then
      insert into public.friends (user_id, friend_id, status)
      values (new.friend_id, new.user_id, 'accepted');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Note: This trigger would need to be created if we want automatic bidirectional creation
-- For now, we'll handle this in the application code for more control

