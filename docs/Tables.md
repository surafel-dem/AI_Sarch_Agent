## **1. `users` Table**

Add a `last_session_id` column to the `users` table to track the user's most recent chat session.

### Command:

sql

Copy code

`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_session_id UUID NULL REFERENCES public.chat_sessions(id) ON DELETE SET NULL;`

### Description:

- **`last_session_id`**: Stores the ID of the user's most recent chat session.
- **Reference**: Links to the `chat_sessions` table (to be created).
- **ON DELETE SET NULL**: If the session is deleted, set this column to NULL to avoid orphaned references.

---

## **2. Create `chat_sessions` Table**

The `chat_sessions` table groups messages into sessions, making it easier to display conversations in the sidebar.

### Command:

sql

Copy code

```sql
CREATE TABLE public.chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    last_message JSONB NULL,
    constraint chat_sessions_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id 
ON public.chat_sessions (user_id);
```

### Description:

- **`id`**: Unique session identifier (UUID).
- **`user_id`**: References the `users` table to tie each session to a user.
- **`title`**: Optional session name (default: "New Chat").
- **`created_at`** and **`updated_at`**: Timestamps for session creation and updates.
- **`last_message`**: Stores the last message in JSONB format for quick access.
- **Index**: Speeds up queries based on `user_id` to fetch sessions quickly.

---

## **3. Update `chat_memory` Table**

The `chat_memory` table stores individual messages, and now it should reference the `chat_sessions` table.

### Command:

sql

Copy code

`ALTER TABLE public.chat_memory ADD COLUMN IF NOT EXISTS session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE;  CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id  ON public.chat_memory (session_id);`

### Description:

- **`session_id`**: Links each message to a specific session in `chat_sessions`.
- **ON DELETE CASCADE**: If a session is deleted, its messages will be automatically removed.
- **Index**: Optimizes queries when filtering messages by `session_id`.

---

## **4. Trigger to Update User's `total_conversations` and `last_session_id`**

Create a trigger to update the user's total conversation count and `last_session_id` every time a new session is added.

### Command:

sql

Copy code

```sql
CREATE OR REPLACE FUNCTION update_user_conversations() RETURNS TRIGGER AS $$ BEGIN   -- Increment total_conversations and set last_session_id   UPDATE public.users   SET total_conversations = total_conversations + 1,       last_session_id = NEW.id,       updated_at = timezone('utc', now())   WHERE id = NEW.user_id;    RETURN NEW; END; $$ LANGUAGE plpgsql;  -- Attach trigger to chat_sessions table CREATE TRIGGER trigger_update_user_conversations AFTER INSERT ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION update_user_conversations();
```

### Description:

- **Function**: Updates the `total_conversations` and `last_session_id` in the `users` table.
- **Trigger**: Executes after a new row is inserted into the `chat_sessions` table.

---

## **5. Automatic Timestamp Updates for `chat_sessions`**

Keep the `updated_at` column in `chat_sessions` up-to-date whenever a row is modified.

### Command:

sql

Copy code

```sql
CREATE OR REPLACE FUNCTION update_chat_sessions_timestamp() RETURNS TRIGGER AS $$ BEGIN   NEW.updated_at = timezone('utc', now());   RETURN NEW; END; $$ LANGUAGE plpgsql;  CREATE TRIGGER trigger_update_chat_sessions_timestamp BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION update_chat_sessions_timestamp();
```

### Description:

- Automatically updates the `updated_at` column in the `chat_sessions` table whenever the session is modified.

---

## **6. Schema Overview**

Here’s a quick overview of the updated schema:

### **`users` Table**

Tracks user-level information with the addition of `last_session_id`:

sql

Copy code

```sql
id UUID PRIMARY KEY, email TEXT, last_seen_at TIMESTAMPTZ, total_conversations INTEGER, last_session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL, -- Other fields...
```

### **`chat_sessions` Table**

Groups messages into sessions for each user:

sql

Copy code

```sql
id UUID PRIMARY KEY, user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, title TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, last_message JSONB NULL
```

### **`chat_memory` Table**

Stores individual messages for each session:

sql

Copy code

```sql
id SERIAL PRIMARY KEY, session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE, message JSONB, created_at TIMESTAMPTZ
```

---

## **7. Example Queries**

### 1. **Fetch Chat History for a User**

Retrieve all sessions for a specific user, sorted by creation date:

sql

Copy code

```sql
SELECT id, title, created_at, updated_at FROM public.chat_sessions WHERE user_id = 'user-uuid-placeholder' ORDER BY created_at DESC;
```

### 2. **Fetch Messages for a Session**

Retrieve all messages for a specific session:

sql

Copy code

```sql
SELECT id, message, created_at FROM public.chat_memory WHERE session_id = 'session-uuid-placeholder' ORDER BY created_at ASC;
```

### 3. **Fetch User's Latest Chat Session**

Get the most recent session for a user:

sql

Copy code

```sql
SELECT s.id, s.title, s.created_at, s.updated_at FROM public.chat_sessions s JOIN public.users u ON s.id = u.last_session_id WHERE u.id = 'user-uuid-placeholder';
```

### 4. **Top Users by Total Conversations**

Retrieve the users with the most chat sessions:

sql

Copy code

```sql
SELECT id, email, total_conversations FROM public.users ORDER BY total_conversations DESC;
```

---

## **Database Schema**

### Users Table
```sql
-- Enable RLS
alter table users enable row level security;

-- Allow users to view their own data
create policy "Users can view their own data"
  on users for select
  using (clerk_id = auth.uid()::text);

-- Allow users to update their own data
create policy "Users can update their own data"
  on users for update
  using (clerk_id = auth.uid()::text);

-- Allow service role to manage all users
create policy "Service role can manage users"
  on users
  as restrictive
  using (auth.role() = 'service_role');

create table public.users (
  id uuid not null default gen_random_uuid(),
  email text null,
  last_seen_at timestamp with time zone null default current_timestamp,
  total_conversations integer null default 0,
  total_searches integer null default 0,
  created_at timestamp with time zone null default current_timestamp,
  updated_at timestamp with time zone null default current_timestamp,
  avatar_url text null,
  message_count integer null default 0,
  token_usage integer null default 0,
  subscription_tier text null default 'free'::text,
  subscription_status text null default 'active'::text,
  clerk_id text not null,
  last_session_id uuid null,
  constraint users_pkey primary key (id),
  constraint users_clerk_id_key unique (clerk_id),
  constraint users_last_session_id_fkey foreign key (last_session_id) references chat_sessions (id) on delete set null
);

create index if not exists users_clerk_id_idx on public.users using btree (clerk_id);

-- Timestamp update trigger
create or replace function update_user_timestamp()
returns trigger as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$ language plpgsql;

create trigger update_users_timestamp
  before update on users
  for each row
  execute function update_user_timestamp();
```

### Chat Sessions Table
```sql
-- Enable RLS
alter table chat_sessions enable row level security;

-- Allow service role full access
create policy "Service role can manage chat sessions"
  on chat_sessions
  using (auth.role() = 'service_role');

-- Allow users to view their own chat sessions
create policy "Users can view their own chat sessions"
  on chat_sessions for select
  using (
    exists (
      select 1 from users
      where users.id = chat_sessions.user_id
      and users.clerk_id = auth.uid()::text
    )
  );

-- Allow users to insert their own chat sessions
create policy "Users can insert their own chat sessions"
  on chat_sessions for insert
  with check (
    exists (
      select 1 from users
      where users.id = chat_sessions.user_id
      and users.clerk_id = auth.uid()::text
    )
  );

-- Allow users to update their own chat sessions
create policy "Users can update their own chat sessions"
  on chat_sessions for update
  using (
    exists (
      select 1 from users
      where users.id = chat_sessions.user_id
      and users.clerk_id = auth.uid()::text
    )
  );

create table chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message jsonb null,
  constraint chat_sessions_pkey primary key (id)
);

-- Add trigger to update user stats
create or replace function update_user_stats_on_session()
returns trigger as $$
begin
  update users
  set total_conversations = total_conversations + 1,
      last_session_id = NEW.id,
      updated_at = current_timestamp
  where id = NEW.user_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_chat_session_created
  after insert on chat_sessions
  for each row
  execute function update_user_stats_on_session();
```

### Chat Memory Table
```sql
-- Enable RLS
alter table chat_memory enable row level security;

-- Allow service role full access
create policy "Service role can manage chat memory"
  on chat_memory
  using (auth.role() = 'service_role');

-- Allow users to view their own chat messages
create policy "Users can view their own chat messages"
  on chat_memory for select
  using (
    exists (
      select 1 from chat_sessions
      join users on users.id = chat_sessions.user_id
      where chat_sessions.id = chat_memory.session_id
      and users.clerk_id = auth.uid()::text
    )
  );

-- Allow users to insert messages to their own sessions
create policy "Users can insert messages to their own sessions"
  on chat_memory for insert
  with check (
    exists (
      select 1 from chat_sessions
      join users on users.id = chat_sessions.user_id
      where chat_sessions.id = chat_memory.session_id
      and users.clerk_id = auth.uid()::text
    )
  );

create table chat_memory (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references chat_sessions(id) on delete cascade,
  message jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add trigger to update user message count
create or replace function update_user_message_count()
returns trigger as $$
begin
  update users
  set message_count = message_count + 1,
      updated_at = current_timestamp
  where id = (
    select user_id from chat_sessions
    where id = NEW.session_id
  );
  return NEW;
end;
$$ language plpgsql;

create trigger on_chat_message_created
  after insert on chat_memory
  for each row
  execute function update_user_message_count();
```

### Search Sessions Table
```sql
-- Enable RLS
alter table search_sessions enable row level security;

-- Allow service role full access
create policy "Service role can manage search sessions"
  on search_sessions
  using (auth.role() = 'service_role');

-- Allow users to view their own search sessions
create policy "Users can view their own search sessions"
  on search_sessions for select
  using (
    exists (
      select 1 from users
      where users.id = search_sessions.user_id
      and users.clerk_id = auth.uid()::text
    )
  );

-- Allow users to insert their own search sessions
create policy "Users can insert their own search sessions"
  on search_sessions for insert
  with check (
    exists (
      select 1 from users
      where users.id = search_sessions.user_id
      and users.clerk_id = auth.uid()::text
    )
  );

create table search_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references users(id) on delete cascade,
  filters jsonb not null,
  results jsonb not null,
  results_count integer not null,
  status text not null check (status in ('completed', 'no_results', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add trigger to update user search count
create or replace function update_user_search_count()
returns trigger as $$
begin
  update users
  set total_searches = total_searches + 1,
      updated_at = current_timestamp
  where id = NEW.user_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_search_session_created
  after insert on search_sessions
  for each row
  execute function update_user_search_count();
```

### Helper Functions

```sql
-- Function to get user's chat history with latest message
create or replace function get_user_chat_history(p_clerk_id text)
returns table (
  session_id uuid,
  title text,
  last_message jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) security definer
set search_path = public
as $$
begin
  return query
  select 
    cs.id as session_id,
    cs.title,
    (
      select cm.message
      from chat_memory cm
      where cm.session_id = cs.id
      order by cm.created_at desc
      limit 1
    ) as last_message,
    cs.created_at,
    cs.updated_at
  from chat_sessions cs
  join users u on u.id = cs.user_id
  where u.clerk_id = p_clerk_id
  order by cs.updated_at desc;
end;
$$ language plpgsql;

-- Function to get user stats
create or replace function get_user_stats(p_clerk_id text)
returns table (
  total_conversations integer,
  total_searches integer,
  message_count integer,
  token_usage integer,
  subscription_tier text,
  subscription_status text
) security definer
set search_path = public
as $$
begin
  return query
  select
    u.total_conversations,
    u.total_searches,
    u.message_count,
    u.token_usage,
    u.subscription_tier,
    u.subscription_status
  from users u
  where u.clerk_id = p_clerk_id;
end;
$$ language plpgsql;