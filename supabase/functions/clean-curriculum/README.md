# Curriculum text cleanup

`clean-curriculum` is an admin-only Edge Function. It proposes OpenAI-assisted
formatting repairs and stores them in `curriculum_text_cleanups`. It never
changes source curriculum data during a scan.

## Deploy

```bash
npx supabase db push
npx supabase secrets set --env-file supabase/.env.functions
npx supabase functions deploy clean-curriculum
```

Because the shared OpenAI client is also used by learner feedback, deploy the
other functions after updating it:

```bash
npx supabase functions deploy ai-feedback
npx supabase functions deploy evaluate-submission
```

## Authenticate

Use the project's server-side Supabase secret key. Never use this function from
the browser and never expose the secret key in React environment variables.

Set these only in your local terminal session:

```bash
export CLEANUP_FUNCTION_URL="https://YOUR_PROJECT_REF.supabase.co/functions/v1/clean-curriculum"
export SUPABASE_SECRET_KEY="YOUR_SERVER_SIDE_SECRET_KEY"
```

## Scan

The default scan processes suspicious strings only and makes at most three
OpenAI requests. `maxCells` is capped at 10 to control cost and runtime.

```bash
curl --request POST "$CLEANUP_FUNCTION_URL" \
  --header "apikey: $SUPABASE_SECRET_KEY" \
  --header "Content-Type: application/json" \
  --data '{"action":"scan","table":"problem_commentary","offset":0,"rowLimit":20,"maxCells":3}'
```

Repeat with the returned `next_offset`. Supported tables are `problems`,
`problem_commentary`, `sample_cases`, and `subtasks`. Use `"includeAll":true`
only when you intentionally want every eligible text cell reviewed.

Review proposals in the Supabase Table Editor under
`curriculum_text_cleanups`. Semantic changes have `needs_review = true` and
`meaning_changed = true`.

## Apply or reject

Applying verifies that the source still exactly matches `original_text`. If the
pipeline changed it after the scan, the proposal becomes `stale` instead of
overwriting newer data.

```bash
curl --request POST "$CLEANUP_FUNCTION_URL" \
  --header "apikey: $SUPABASE_SECRET_KEY" \
  --header "Content-Type: application/json" \
  --data '{"action":"apply","proposalIds":[1,2]}'
```

```bash
curl --request POST "$CLEANUP_FUNCTION_URL" \
  --header "apikey: $SUPABASE_SECRET_KEY" \
  --header "Content-Type: application/json" \
  --data '{"action":"reject","proposalIds":[3]}'
```
