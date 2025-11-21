-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- WORK RELATIONS
create table public.work_relations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  institution_name text not null,
  contract_type text not null check (contract_type in ('CLT', 'PJ', 'Informal')),
  hourly_rate numeric,
  standard_shift_value numeric,
  color text default '#3B82F6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.work_relations enable row level security;

create policy "Users can view their own work relations" on public.work_relations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own work relations" on public.work_relations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own work relations" on public.work_relations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own work relations" on public.work_relations
  for delete using (auth.uid() = user_id);

-- SHIFTS
create table public.shifts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  work_relation_id uuid references public.work_relations(id) on delete cascade,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  estimated_value numeric,
  is_manual_entry boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.shifts enable row level security;

create policy "Users can view their own shifts" on public.shifts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own shifts" on public.shifts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own shifts" on public.shifts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own shifts" on public.shifts
  for delete using (auth.uid() = user_id);

-- Functions for handling new user creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

