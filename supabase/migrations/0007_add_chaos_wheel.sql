-- Run this in the Supabase SQL editor for this project.
-- Adds the turn-based "Roue du Chaos" movement system.

-- Result of the current round's wheel spin (1-6), null = not spun yet this round.
alter table players
  add column if not exists roll integer;

-- Whether the player has already moved during the current round.
alter table players
  add column if not exists has_moved boolean not null default false;

-- Current round number, advanced by the narrator screen once everyone has moved.
alter table games
  add column if not exists round integer not null default 1;
