-- Whether the terminal that builds a staff sells its head item. Each terminal
-- sells two of the seven heads, and a head is carried to another terminal, so a
-- staff whose head is not sold here is still built here. Null on every other
-- tool, and on a staff written before this column.
alter table public.tools
  add column head_sold_here boolean;
