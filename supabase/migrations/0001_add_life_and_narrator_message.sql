-- Run this in the Supabase SQL editor for this project.
-- Adds the columns required by the narrator "Joueurs" tab
-- (life management + direct messages to a player's phone).

alter table players
  add column if not exists life integer not null default 100;

alter table players
  add column if not exists narrator_message text;
