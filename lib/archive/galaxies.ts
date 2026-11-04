// The galaxies the pages name, by the name a table or a sentence prints.
const GALAXY_PAGES: Record<string, string> = {
  Euclid: "b7e59a53-13de-521b-af6b-dcbf6280eb9d",
  Calypso: "8b530a0e-fdc9-50a6-969b-6ea1773fa26f",
  Budullangr: "f0913c73-fbc9-50b0-86a2-b405a0c56a11",
  Eissentam: "1f9bc2b3-5d1e-5972-8415-954b2acef14a",
  Dugnowarilda: "2ea3d2e8-8c0d-5073-bb38-5d0c36e3aada",
};

export function galaxyHref(name: string) {
  const id = GALAXY_PAGES[name];
  return id ? `/galaxy/${id}` : undefined;
}
