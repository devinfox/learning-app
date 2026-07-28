-- Arcade play history. One row per completed run, aggregated on read into the
-- counters shown on the arcade card. Same shape and conventions as 0001.

create table if not exists public.arcade_plays (like public.users including all);

create index if not exists arcade_plays_user_id_idx on public.arcade_plays (user_id);
create index if not exists arcade_plays_seq_idx on public.arcade_plays (seq);
create index if not exists arcade_plays_game_idx on public.arcade_plays ((data ->> 'gameId'));

alter table public.arcade_plays enable row level security;
