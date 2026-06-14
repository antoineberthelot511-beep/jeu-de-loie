-- Run this in the Supabase SQL editor for this project.
-- Adds the data needed for the "Camarade Mishka" boss fight
-- in Communisme Land (la forêt mystérieuse).

-- Combat state for the whole game (boss, hp, round, log).
alter table games
  add column if not exists combat jsonb not null default '{"active": false, "bossName": "", "bossHp": 0, "bossMaxHp": 0, "round": 0, "log": []}'::jsonb;

-- Action chosen by the player for the current combat round ('attack' or null).
alter table players
  add column if not exists combat_action text;

-- Whether the player has been sent to the goulag and must skip the next round.
alter table players
  add column if not exists in_goulag boolean not null default false;
