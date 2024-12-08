-- Create users table if it doesn't exist
create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  clerk_id text unique not null,
  email text,
  avatar_url text,
  subscription_tier text default 'free',
  subscription_status text default 'active',
  total_conversations integer default 0,
  total_searches integer default 0,
  message_count integer default 0,
  token_usage integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies
create policy "Users can view their own data"
  on public.users
  for select
  using (auth.uid()::text = clerk_id);

create policy "Service role can manage all users"
  on public.users
  using (true)
  with check (true);
