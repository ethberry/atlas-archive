-- Every enumerated column holds what the generator can write, and short lists
-- hold readable words. store maps the game's names to these words; the
-- fixtures in crimson-orb stay in the game's keys.

-- hull: Dropship, Scientific, Royal, Sail, and Robot are the game's enum names.
update public.ships
set hull = case hull
  when 'Dropship' then 'hauler'
  when 'Fighter' then 'fighter'
  when 'Scientific' then 'explorer'
  when 'Shuttle' then 'shuttle'
  when 'Royal' then 'exotic'
  when 'Sail' then 'solar'
  when 'Robot' then 'interceptor'
  else hull
end;

-- body: the card calls Pristine Experimental.
update public.tools
set body = case body
  when 'Pistol' then 'pistol'
  when 'Rifle' then 'rifle'
  when 'Pristine' then 'experimental'
  when 'Alien' then 'alien'
  when 'Royal' then 'royal'
  else body
end;

-- affinity: the loc keys become the words the card prints.
update public.creatures
set affinity = case affinity
  when 'UI_PB_AFFINITY_LUSH' then 'tropical'
  when 'UI_PB_AFFINITY_COLD' then 'frost'
  when 'UI_PB_AFFINITY_HOT' then 'fire'
  when 'UI_PB_AFFINITY_TOXIC' then 'toxic'
  when 'UI_PB_AFFINITY_DUST' then 'desert'
  when 'UI_PB_AFFINITY_RADIO' then 'radioactive'
  when 'UI_PB_AFFINITY_WEIRD' then 'anomalous'
  when 'UI_PB_AFFINITY_MECH' then 'mechanical'
  else affinity
end;

-- A card shows no conflict on an abandoned station, and no economy, wealth,
-- or conflict in an uncharted system. The roll still holds a value there.
update public.systems
set conflict = null
where station = 'abandoned';

update public.systems
set economy = null, wealth = null, conflict = null
where station = 'uncharted';

alter table public.systems
  alter column population set not null,
  alter column water set not null,
  alter column dissonance set not null,
  alter column gas_giant set not null,
  add constraint systems_star_check check (
    star in ('yellow', 'green', 'blue', 'red', 'purple')
  ),
  add constraint systems_population_check check (
    population in ('gek', 'vykeen', 'korvax', 'uncharted')
  ),
  add constraint systems_station_check check (
    station in ('inhabited', 'abandoned', 'pirate', 'uncharted')
  ),
  add constraint systems_economy_check check (
    economy is null or economy in (
      'mining', 'manufacturing', 'technology', 'power', 'science', 'trading', 'alloy'
    )
  ),
  add constraint systems_wealth_check check (
    wealth is null or wealth in ('low', 'medium', 'high', 'pirate')
  ),
  add constraint systems_conflict_check check (
    conflict is null or conflict in ('low', 'medium', 'high', 'pirate')
  );

-- biome is the Biome enum index. Test (11) and All (16) are never rolled.
-- ancient_bones stays nullable: the object-list walk can stop before the list
-- that carries the hint, and then the answer is unknown.
alter table public.bodies
  alter column biome set not null,
  alter column sentinels set not null,
  alter column salvageable_scrap set not null,
  alter column activated_stellar set not null,
  alter column water set not null,
  alter column gas_giant set not null,
  add constraint bodies_biome_check check (biome between 0 and 15 and biome <> 11),
  add constraint bodies_sentinels_check check (sentinels in ('low', 'high', 'aggressive'));

-- class keeps all four letters: a wreck is rolled at any class, though only S
-- is stored until the model seed is generated.
alter table public.ships
  alter column hull set not null,
  alter column class set not null,
  add constraint ships_hull_check check (
    hull in ('hauler', 'fighter', 'explorer', 'shuttle', 'exotic', 'solar', 'interceptor')
  ),
  add constraint ships_class_check check (class in ('C', 'B', 'A', 'S'));

-- body holds what a sentinel pillar pays, the only tools stored. Storing a
-- cabinet tool adds its bodies here.
alter table public.tools
  alter column body set not null,
  alter column class set not null,
  add constraint tools_body_check check (
    body in ('pistol', 'rifle', 'experimental', 'alien', 'royal')
  ),
  add constraint tools_class_check check (class in ('C', 'B', 'A', 'S'));

-- Physical is never rolled: a template without a forced affinity takes the
-- biome's, and no biome has none.
alter table public.creatures
  alter column combat set not null,
  alter column agility set not null,
  alter column health set not null,
  alter column affinity set not null,
  alter column habitat set not null,
  alter column active_time set not null,
  add constraint creatures_affinity_check check (
    affinity in (
      'tropical', 'frost', 'fire', 'toxic', 'desert', 'radioactive', 'anomalous', 'mechanical'
    )
  ),
  add constraint creatures_habitat_check check (
    habitat in ('ground', 'air', 'water', 'cave')
  ),
  add constraint creatures_active_time_check check (
    active_time in ('day', 'mostly_day', 'any', 'mostly_night', 'night')
  );
