-- The portal glyphs are the body's locator without the galaxy byte
-- (lib/archive/address.ts), so they are not stored.

alter table public.bodies
  drop column glyphs;
