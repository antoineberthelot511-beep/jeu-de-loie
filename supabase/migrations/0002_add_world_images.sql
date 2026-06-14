-- Run this in the Supabase SQL editor for this project.
-- Lets the narrator customize the background image of each world
-- from the "Réglages" tab.

-- Stores the custom image URL of each world, keyed by world id (world1..world4).
alter table games
  add column if not exists world_images jsonb not null default '{}'::jsonb;

-- Public storage bucket hosting the custom map images.
insert into storage.buckets (id, name, public)
values ('maps', 'maps', true)
on conflict (id) do nothing;

-- Anyone can read files from the "maps" bucket (it's public).
drop policy if exists "Public read access for maps" on storage.objects;
create policy "Public read access for maps"
  on storage.objects for select
  using (bucket_id = 'maps');

-- The narrator (using the anon key) can upload and replace map images.
drop policy if exists "Public upload access for maps" on storage.objects;
create policy "Public upload access for maps"
  on storage.objects for insert
  with check (bucket_id = 'maps');

drop policy if exists "Public update access for maps" on storage.objects;
create policy "Public update access for maps"
  on storage.objects for update
  using (bucket_id = 'maps');
