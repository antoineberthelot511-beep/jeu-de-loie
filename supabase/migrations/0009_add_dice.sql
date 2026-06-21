-- Run this in the Supabase SQL editor for this project.
-- Dernier résultat du dé lancé par le narrateur en mode Jeu (1-6), affiché à tous.

alter table games
  add column if not exists dice_roll integer;
