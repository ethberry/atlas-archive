-- Latitude and longitude as the analysis visor shows them.

alter table public.pois
  add column latitude double precision,
  add column longitude double precision;
