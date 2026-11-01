-- A ship's card shows the ship as it reaches the hangar, not the wreck: from
-- here `base_*` of a ship holds the claimed base, each stat the larger draw of
-- the layout and the model seed. A card also takes the first two draws of the
-- seed of the ship being flown, which for a claimed ship is its own model seed.
-- Null on a row written before these columns.
alter table public.ships
  add column model_draw_1 real,
  add column model_draw_2 real;
