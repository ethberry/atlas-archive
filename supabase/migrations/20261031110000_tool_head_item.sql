-- A staff is built at the Synthesis Terminal of a robot head, and the head item
-- fitted decides which staff it is, so the row names that item. head_item is
-- the game's item id, not the slot id a built staff stores. It is filled for a
-- staff and for nothing else.
alter table public.tools
  add column head_item text,
  drop constraint tools_body_check,
  add constraint tools_body_check check (
    body in (
      'pistol',
      'rifle',
      'experimental',
      'alien',
      'royal',
      'sentinel',
      'atlantid',
      'staff'
    )
  ),
  add constraint tools_head_item_check check (
    head_item in (
      'STAFF_PART_C',
      'STAFF_HEAD1',
      'STAFF_HEAD2',
      'STAFF_HEAD4A',
      'STAFF_HEAD4B',
      'STAFF_HEAD5',
      'STAFF_HEAD6'
    )
  ),
  add constraint tools_staff_head_item_check check (
    (body = 'staff') = (head_item is not null)
  );
