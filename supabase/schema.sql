-- JEE ASCENT - cloud sync schema
--
-- Run this once in the Supabase SQL editor. It creates a single table holding
-- one save per learner, and the row-level security that makes the public anon
-- key safe to ship in the client.
--
-- The whole save is one JSONB document on purpose. It is already a single
-- self-consistent object with its own schema version, and the client merges
-- two of them field by field (public/js/core/merge.js). Splitting it into
-- relational tables would add a migration burden and buy nothing, because
-- nothing server-side ever queries inside it.

create table if not exists public.saves (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Without this, the anon key would read every row in the table.
alter table public.saves enable row level security;

-- Each policy is scoped to auth.uid(), the id baked into the caller's JWT.
-- A learner can therefore only ever touch their own row, and the anon key
-- grants no access at all until someone signs in.
drop policy if exists "read own save"   on public.saves;
drop policy if exists "insert own save" on public.saves;
drop policy if exists "update own save" on public.saves;

create policy "read own save" on public.saves
  for select using (auth.uid() = user_id);

create policy "insert own save" on public.saves
  for insert with check (auth.uid() = user_id);

create policy "update own save" on public.saves
  for update using (auth.uid() = user_id)
             with check (auth.uid() = user_id);

-- Deliberately no delete policy: the client never deletes a save, and the row
-- goes away with the account via the cascade above.

-- Keep updated_at honest even if a client forgets to send it.
create or replace function public.touch_saves_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists saves_touch_updated_at on public.saves;
create trigger saves_touch_updated_at
  before insert or update on public.saves
  for each row execute function public.touch_saves_updated_at();
