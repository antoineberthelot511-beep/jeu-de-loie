-- Run this in the Supabase SQL editor for this project.
-- Adds the player's position on the new board game path
-- (index into src/data/board.ts, 0 = case de départ).

alter table players
  add column if not exists node_index integer not null default 0;
