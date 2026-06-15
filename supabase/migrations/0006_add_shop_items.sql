-- Run this in the Supabase SQL editor for this project.
-- Stores the product catalog for the "Épicerie du village" shop screen.

alter table games
  add column if not exists shop_items jsonb not null default '[]'::jsonb;
