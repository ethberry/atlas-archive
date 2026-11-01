-- A shop pays a Standard tool and a monolith an Atlantid tool; store writes
-- both. atlantid covers the three models of ATLASMULTITOOL.DESCRIPTOR.MBIN,
-- which differ in colour only. sentinel is the Robot body of the Sentinel
-- pool, which no stored place pays yet.
alter table public.tools
  drop constraint tools_body_check,
  add constraint tools_body_check check (
    body in (
      'pistol',
      'rifle',
      'experimental',
      'alien',
      'royal',
      'sentinel',
      'atlantid'
    )
  );
