-- face, i, and j are in the point's locator, the argument of utils.place;
-- the site does not show them.

alter table public.pois
  drop column face,
  drop column i,
  drop column j;
