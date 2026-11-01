-- layout_seed is the seed of the wreck's cell; model_seed is shared by one
-- hull on one body and stays empty until it is generated.

alter table public.ships
  add column layout_seed text,
  add column model_seed text;
