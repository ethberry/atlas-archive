-- The 256 galaxies. index is the galaxy byte of the address (Euclid is 0).
-- featured orders up to four galaxies on the home page.

alter table public.galaxies
  add column index smallint not null,
  add column type text not null,
  add column featured smallint,
  add constraint galaxies_index_key unique (index),
  add constraint galaxies_index_check check (index between 0 and 255),
  add constraint galaxies_type_check check (type in ('normal', 'harsh', 'lush', 'empty')),
  add constraint galaxies_featured_key unique (featured),
  add constraint galaxies_featured_check check (featured is null or featured between 1 and 4);
