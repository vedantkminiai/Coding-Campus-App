-- Server-side code judging and private learner feedback history.
create table if not exists public.code_submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  language text not null check (language in ('python', 'cpp', 'java')),
  source_code text not null check (char_length(source_code) <= 50000),
  status text not null,
  passed boolean not null default false,
  score integer not null default 0 check (score between 0 and 100),
  stdout text not null default '',
  stderr text not null default '',
  runtime_ms integer,
  memory_kb integer,
  test_count integer not null default 0,
  passed_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id bigint references public.code_submissions(id) on delete set null,
  problem_id text not null,
  request_type text not null check (request_type in ('hint', 'wrong_solution')),
  diagnosis text not null,
  hint text not null,
  concepts_to_review text[] not null default '{}',
  next_step text not null,
  complexity_feedback text not null default '',
  created_at timestamptz not null default now()
);

-- Never expose these rows through the browser Data API. Edge Functions use the
-- server-side secret client to read them after authenticating the learner.
create table if not exists public.hidden_test_cases (
  id bigint generated always as identity primary key,
  problem_id text not null,
  label text not null default 'Hidden test',
  input text not null default '',
  expected_output text not null,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists code_submissions_user_created_idx
  on public.code_submissions (user_id, created_at desc);
create index if not exists code_submissions_problem_idx
  on public.code_submissions (problem_id);
create index if not exists ai_feedback_user_created_idx
  on public.ai_feedback (user_id, created_at desc);
create index if not exists hidden_test_cases_problem_idx
  on public.hidden_test_cases (problem_id, position)
  where is_active;

alter table public.code_submissions enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.hidden_test_cases enable row level security;

grant select on table public.code_submissions to authenticated;
grant select on table public.ai_feedback to authenticated;
revoke all on table public.hidden_test_cases from anon, authenticated;
revoke all on table public.code_submissions from anon;
revoke all on table public.ai_feedback from anon;

drop policy if exists "Users can read their own code submissions" on public.code_submissions;
create policy "Users can read their own code submissions"
  on public.code_submissions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own AI feedback" on public.ai_feedback;
create policy "Users can read their own AI feedback"
  on public.ai_feedback for select to authenticated
  using (auth.uid() = user_id);
