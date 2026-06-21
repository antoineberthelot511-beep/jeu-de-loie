-- Run this in the Supabase SQL editor for this project.
-- Stores the narrator's canvas board (elements + background) so it survives reloads.

alter table games
  add column if not exists board jsonb;
