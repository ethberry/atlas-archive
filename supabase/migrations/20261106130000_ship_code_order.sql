-- The ship code of a wreck's name follows the platform: the PC and Xbox builds draw its three
-- numbers in the order the site now prints, the PlayStation 4 and the Mac in the other. The stored
-- names were written in the Mac order; this renames them to the PC order.
begin;
update public.assets set name = 'Crystal Mother RO3' where kind = 'ship' and locator = 'ship:00100402041DE9B9.0.4.219';
update public.assets set name = 'Sanukiha JL2' where kind = 'ship' and locator = 'ship:00100700FD396278.1.165.140';
update public.assets set name = 'WX6 Piporri' where kind = 'ship' and locator = 'ship:00100700FD396278.5.205.119';
update public.assets set name = 'IY3 Megawa' where kind = 'ship' and locator = 'ship:0010380004B1306F.3.261.215';
update public.assets set name = 'KJ4 Toonta' where kind = 'ship' and locator = 'ship:00103909FD4303A7.0.19.118';
update public.assets set name = 'Binomig''s Hand JO8' where kind = 'ship' and locator = 'ship:00103C0604CBC0CD.0.9.311';
update public.assets set name = 'Lucent Departure CN8' where kind = 'ship' and locator = 'ship:00104900FDF825ED.0.24.32';
update public.assets set name = 'Raging Bard SB5' where kind = 'ship' and locator = 'ship:00105D00044D4F87.0.298.52';
update public.assets set name = 'Stellar Focus QQ2' where kind = 'ship' and locator = 'ship:00105D00044D4F87.0.0.46';
update public.assets set name = 'TJ4 Ahirak' where kind = 'ship' and locator = 'ship:00106E06C60E696E.0.3.382';
update public.assets set name = 'Relentless Omen WB3' where kind = 'ship' and locator = 'ship:0010AE003F03A281.0.353.204';
update public.assets set name = 'IJ2 Zentana' where kind = 'ship' and locator = 'ship:0010C200D752F153.2.189.161';
update public.assets set name = 'Noichic JP2' where kind = 'ship' and locator = 'ship:0010CA00972E3575.0.259.273';
update public.assets set name = 'Shimmering Dance MT9' where kind = 'ship' and locator = 'ship:001112006EE14F30.0.4.415';
update public.assets set name = 'Arider SZ2' where kind = 'ship' and locator = 'ship:00120C0033CF5386.0.155.115';
update public.assets set name = 'Zakamag''s Decree CN2' where kind = 'ship' and locator = 'ship:00140A008A5ACD09.0.44.35';
update public.assets set name = 'Swift Mother IE8' where kind = 'ship' and locator = 'ship:00140A008A5ACD09.1.4.38';
update public.assets set name = 'Shimmering Dance MT9' where kind = 'ship' and locator = 'ship:001112006EE14F30.0.4.415';
update public.assets set name = 'KJ4 Toonta' where kind = 'ship' and locator = 'ship:00103909FD4303A7.0.19.118';
commit;
