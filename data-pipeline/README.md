# CCC ETL

A modular Extract → Transform → Load pipeline for official Waterloo CEMC CCC
problem and commentary HTML. The initial source is 2025 Senior (S1–S5).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
```

Apply [`sql/001_ccc_schema.sql`](sql/001_ccc_schema.sql) in the Supabase SQL
editor. Set `SUPABASE_URL` and a server-side `SUPABASE_KEY` in the environment.
Do not expose a service-role key in a browser or commit it.

Parse and validate without database writes:

```bash
python main.py --dry-run
python main.py --dry-run --json
```

Discover all Junior and Senior contest links across the three Waterloo archive
pages, then process 2025 down to 2022:

```bash
python main.py --archive --start-year 2025 --end-year 2022 --archive-pages 3 --dry-run
```

Remove `--dry-run` to load all 40 problems. Archive discovery prefers the
official HTML “View Contest” and “View Solution” links. If either is absent or
cannot be parsed, it falls back to the contest PDF or the commentary PDF inside
the official ZIP download.

Run the complete pipeline:

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_KEY=your-server-side-key
python main.py
```

Each problem is sent to a PostgreSQL function in one transaction. Problems and
commentary are upserted; samples and subtasks are replaced so reruns are
idempotent and stale child records are removed.

## Add another year

For archived CCC years, pass a different `--start-year`/`--end-year` range; no
manual URLs are needed. A one-off source can still be added as a `SourceConfig`
entry in `config.py`. Configured problem numbers act as a completeness check.

## Test

```bash
pytest
```
