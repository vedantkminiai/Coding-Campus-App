-- Private, reviewable proposals for curriculum text cleanup.
create table if not exists public.curriculum_text_cleanups (
  id bigint generated always as identity primary key,
  source_table text not null check (source_table in ('problems', 'problem_commentary', 'sample_cases', 'subtasks')),
  source_row_id text not null,
  source_key text not null,
  source_column text not null,
  original_hash text not null,
  original_text text not null,
  deterministic_text text not null,
  proposed_text text not null,
  changes jsonb not null default '[]'::jsonb,
  confidence numeric(4, 3) not null check (confidence between 0 and 1),
  needs_review boolean not null default true,
  meaning_changed boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'applied', 'rejected', 'stale', 'error')),
  model text not null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  applied_at timestamptz
);

create unique index if not exists curriculum_text_cleanups_source_hash_idx
  on public.curriculum_text_cleanups
  (source_table, source_row_id, source_column, original_hash);

create index if not exists curriculum_text_cleanups_status_idx
  on public.curriculum_text_cleanups (status, needs_review, created_at desc);

alter table public.curriculum_text_cleanups enable row level security;
revoke all on table public.curriculum_text_cleanups from anon, authenticated;

comment on table public.curriculum_text_cleanups is
  'Admin-only OpenAI cleanup proposals. Source curriculum text changes only after an explicit apply action.';
