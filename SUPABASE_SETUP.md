# Supabase setup

The application uses Supabase Auth plus the `profiles` and `quiz_attempts`
tables. Browser code connects through the Supabase Data API with Row Level
Security; it does not use the PostgreSQL connection string.

## 1. Create the schema

Open your Supabase project's SQL Editor and run:

`supabase/migrations/20260812000000_learning_platform.sql`

The migration creates:

- a public profile for every Auth user;
- quiz-attempt storage and indexes;
- an automatic new-user profile trigger;
- Row Level Security policies for profiles and attempts;
- the grants required by signed-in browser users.

## 2. Configure the React application

Open `.env.local` and replace both placeholders:

```env
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Find these values in the Supabase dashboard under **Project Settings > API**
or in the project's **Connect** dialog.

Do not use the PostgreSQL connection string, database password, secret key, or
service-role key in this React application.

Restart the development server after changing `.env.local`:

```bash
npm start
```

## 3. Authentication settings

In Supabase Authentication settings, configure the Site URL and redirect URLs
for local development and the deployed domain. For local development, add:

```text
http://localhost:3000
```

If email confirmation is enabled, new users must confirm the email before the
first login. The database trigger creates their profile automatically.
