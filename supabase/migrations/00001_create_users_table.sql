-- Create users table
create table if not exists public.users (
    id uuid default gen_random_uuid() primary key,
    clerk_id text unique not null,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Create policies
create policy "Users can view their own data" on public.users
    for select using (auth.uid()::text = clerk_id);

create policy "Service role can manage all users" on public.users
    using (auth.jwt()->>'role' = 'service_role');

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_users_updated_at
    before update on public.users
    for each row
    execute function public.handle_updated_at();
