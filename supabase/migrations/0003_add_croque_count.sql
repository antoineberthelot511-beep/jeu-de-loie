-- Run this in the Supabase SQL editor for this project.
-- Adds a counter used to trigger the croque-monsieur punishment video
-- on a specific player's phone (incremented by the narrator).

alter table players
  add column if not exists croque_count integer not null default 0;
