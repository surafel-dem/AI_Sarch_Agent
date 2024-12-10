-- Create search_sessions table
create table if not exists public.search_sessions (
    id uuid default gen_random_uuid() primary key,
    clerk_id text references public.users(clerk_id),
    filters jsonb,
    query text,
    results_count integer default 0,
    status text default 'pending' check (status in ('pending', 'completed', 'failed')),
    error text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.search_sessions enable row level security;

-- Create policies
create policy "Users can view their own search sessions"
    on public.search_sessions
    for select
    using (auth.uid()::text = clerk_id);

create policy "Users can create their own search sessions"
    on public.search_sessions
    for insert
    with check (auth.uid()::text = clerk_id);

create policy "Users can update their own search sessions"
    on public.search_sessions
    for update
    using (auth.uid()::text = clerk_id);

create policy "Service role can manage all search sessions"
    on public.search_sessions
    using (auth.jwt()->>'role' = 'service_role');

-- Create indexes
create index idx_search_sessions_clerk_id on public.search_sessions(clerk_id);
create index idx_search_sessions_status on public.search_sessions(status);
create index idx_search_sessions_created_at on public.search_sessions(created_at);

-- Create updated_at trigger
create trigger handle_search_sessions_updated_at
    before update on public.search_sessions
    for each row
    execute function public.handle_updated_at();
