-- CCC curriculum content is readable by signed-in learners only.
-- The data pipeline remains responsible for writing these tables.

alter table public.problems enable row level security;
alter table public.problem_commentary enable row level security;
alter table public.sample_cases enable row level security;
alter table public.subtasks enable row level security;

grant select on table public.problems to authenticated;
grant select on table public.problem_commentary to authenticated;
grant select on table public.sample_cases to authenticated;
grant select on table public.subtasks to authenticated;

revoke select on table public.problems from anon;
revoke select on table public.problem_commentary from anon;
revoke select on table public.sample_cases from anon;
revoke select on table public.subtasks from anon;

drop policy if exists "Authenticated users can read CCC problems" on public.problems;
create policy "Authenticated users can read CCC problems"
  on public.problems for select to authenticated using (true);

drop policy if exists "Authenticated users can read CCC commentary" on public.problem_commentary;
create policy "Authenticated users can read CCC commentary"
  on public.problem_commentary for select to authenticated using (true);

drop policy if exists "Authenticated users can read CCC sample cases" on public.sample_cases;
create policy "Authenticated users can read CCC sample cases"
  on public.sample_cases for select to authenticated using (true);

drop policy if exists "Authenticated users can read CCC subtasks" on public.subtasks;
create policy "Authenticated users can read CCC subtasks"
  on public.subtasks for select to authenticated using (true);
