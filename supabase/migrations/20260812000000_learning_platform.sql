create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 30),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  score integer not null check (score between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_topic_idx
  on public.quiz_attempts (user_id, topic_id);

create index if not exists quiz_attempts_topic_score_idx
  on public.quiz_attempts (topic_id, score desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "Authenticated users can read profiles"
  on public.profiles for select to authenticated using (true);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Authenticated users can read quiz attempts"
  on public.quiz_attempts for select to authenticated using (true);
create policy "Users can insert their own quiz attempts"
  on public.quiz_attempts for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users can delete their own quiz attempts"
  on public.quiz_attempts for delete to authenticated
  using (auth.uid() = user_id);

grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.quiz_attempts to authenticated;
grant usage, select on sequence public.quiz_attempts_id_seq to authenticated;
