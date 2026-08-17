create table if not exists public.problems (
    id text primary key,
    year integer not null,
    division text not null check (division in ('Junior', 'Senior')),
    problem_number text not null,
    title text not null,
    description text not null,
    input_specification text not null,
    output_specification text not null,
    source_url text not null,
    unique (year, problem_number)
);

create table if not exists public.problem_commentary (
    id bigint generated always as identity primary key,
    problem_id text not null unique references public.problems(id) on delete cascade,
    commentary text not null
);

create table if not exists public.sample_cases (
    id bigint generated always as identity primary key,
    problem_id text not null references public.problems(id) on delete cascade,
    input_data text not null,
    expected_output text not null,
    explanation text
);

create table if not exists public.subtasks (
    id bigint generated always as identity primary key,
    problem_id text not null references public.problems(id) on delete cascade,
    marks text not null,
    constraints text not null
);

-- These tables are exposed through the public Data API schema. The ETL uses a
-- server-side service-role/secret key, so it can write while RLS remains on.
alter table public.problems enable row level security;
alter table public.problem_commentary enable row level security;
alter table public.sample_cases enable row level security;
alter table public.subtasks enable row level security;

-- One RPC call is one PostgreSQL transaction. Replacing child rows also removes
-- stale samples/subtasks when the upstream document changes.
create or replace function public.upsert_ccc_problem(payload jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
    item jsonb;
begin
    insert into public.problems (
        id, year, division, problem_number, title, description,
        input_specification, output_specification, source_url
    ) values (
        payload->>'problem_id', (payload->>'year')::integer,
        payload->>'division', payload->>'problem_number', payload->>'title',
        payload->>'description', payload->>'input_specification',
        payload->>'output_specification', payload->>'source_url'
    )
    on conflict (id) do update set
        year = excluded.year,
        division = excluded.division,
        problem_number = excluded.problem_number,
        title = excluded.title,
        description = excluded.description,
        input_specification = excluded.input_specification,
        output_specification = excluded.output_specification,
        source_url = excluded.source_url;

    if nullif(payload->>'commentary', '') is not null then
        insert into public.problem_commentary (problem_id, commentary)
        values (payload->>'problem_id', payload->>'commentary')
        on conflict (problem_id) do update set commentary = excluded.commentary;
    else
        delete from public.problem_commentary where problem_id = payload->>'problem_id';
    end if;

    delete from public.sample_cases where problem_id = payload->>'problem_id';
    for item in select value from jsonb_array_elements(coalesce(payload->'samples', '[]'))
    loop
        insert into public.sample_cases (
            problem_id, input_data, expected_output, explanation
        ) values (
            payload->>'problem_id', item->>'input', item->>'output',
            item->>'explanation'
        );
    end loop;

    delete from public.subtasks where problem_id = payload->>'problem_id';
    for item in select value from jsonb_array_elements(coalesce(payload->'subtasks', '[]'))
    loop
        insert into public.subtasks (problem_id, marks, constraints)
        values (payload->>'problem_id', item->>'marks', item->>'constraints');
    end loop;
end;
$$;

-- This function changes application data and should only be called with a
-- trusted server-side service-role key.
revoke execute on function public.upsert_ccc_problem(jsonb) from public;
revoke execute on function public.upsert_ccc_problem(jsonb) from anon;
revoke execute on function public.upsert_ccc_problem(jsonb) from authenticated;
grant execute on function public.upsert_ccc_problem(jsonb) to service_role;
