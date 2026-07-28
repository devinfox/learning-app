-- UVBrain schema.
--
-- Every collection in lib/db/index.ts becomes one table with an identical
-- shape: the row's JSON in `data`, its id lifted out as the primary key, and
-- `seq` preserving insertion order (the JSON file store was an ordered array
-- and several call sites still rely on that order).
--
-- `user_id` is a generated column purely so the tables are filterable in the
-- Supabase table editor and so ownership lookups can be indexed. It is null on
-- tables whose rows have no userId (users, subjects, messages, jobs).
--
-- RLS is enabled with no policies on purpose: that denies the anon and
-- authenticated roles outright, while the service_role key used by the Next.js
-- server bypasses RLS. The app enforces its own auth in lib/auth/session.ts.
-- If a browser-side client is ever added, real policies must be written first.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  data jsonb not null,
  seq bigint generated always as identity,
  user_id text generated always as (data ->> 'userId') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (like public.users including all);
create table if not exists public.sessions (like public.users including all);
create table if not exists public.otps (like public.users including all);
create table if not exists public.subjects (like public.users including all);
create table if not exists public.enrollments (like public.users including all);
create table if not exists public.syllabi (like public.users including all);
create table if not exists public.lessons (like public.users including all);
create table if not exists public.quizzes (like public.users including all);
create table if not exists public.attempts (like public.users including all);
create table if not exists public.progress (like public.users including all);
create table if not exists public.projects (like public.users including all);
create table if not exists public.submissions (like public.users including all);
create table if not exists public.chats (like public.users including all);
create table if not exists public.messages (like public.users including all);
create table if not exists public.jobs (like public.users including all);
create table if not exists public.learner_memories (like public.users including all);
create table if not exists public.course_briefs (like public.users including all);
create table if not exists public.companion_states (like public.users including all);

do $$
declare
  t text;
  names text[] := array[
    'users', 'profiles', 'sessions', 'otps', 'subjects', 'enrollments',
    'syllabi', 'lessons', 'quizzes', 'attempts', 'progress', 'projects',
    'submissions', 'chats', 'messages', 'jobs', 'learner_memories',
    'course_briefs', 'companion_states'
  ];
begin
  foreach t in array names loop
    execute format('create index if not exists %I on public.%I (user_id)', t || '_user_id_idx', t);
    execute format('create index if not exists %I on public.%I (seq)', t || '_seq_idx', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end
$$;
