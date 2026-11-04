// One colour for one thing, on every chart of the site.
const CLASSES = { C: "#bdbdbd", B: "#42a5f5", A: "#1565c0", S: "#ed6c02" };

const NAMED: Record<string, string> = {
  ...CLASSES,
  "Class C": CLASSES.C,
  "Class B": CLASSES.B,
  "Class A": CLASSES.A,
  "Class S": CLASSES.S,
  "Class S tools": CLASSES.S,
  Adjacent: "#1976d2",
  "Adjacent tools": "#1976d2",
  // Ship types.
  Shuttle: "#00897b",
  Fighter: "#c62828",
  Hauler: "#6d4c41",
  Explorer: "#2e7d32",
  Solar: "#f9a825",
  Interceptor: "#6a1b9a",
  Exotic: "#d81b60",
  // Tool types.
  Pistol: "#1e88e5",
  Rifle: "#43a047",
  Atlantid: "#00acc1",
  "Atlantid, plain": "#00acc1",
  "Atlantid, blue": "#3949ab",
  "Atlantid, yellow": "#fdd835",
  Sentinel: "#e53935",
  "Sentinel, pistol": "#e53935",
  "Sentinel, rifle": "#b71c1c",
  Experimental: "#8e24aa",
  Alien: "#7cb342",
  Royal: "#ffb300",
  Staff: "#5e35b1",
  "All staffs": "#5e35b1",
  // Wealth.
  Low: "#90a4ae",
  Medium: "#29b6f6",
  High: "#ffa726",
  Pirate: "#d32f2f",
  // Galaxy types.
  Normal: "#1976d2",
  Harsh: "#d84315",
  Empty: "#78909c",
  Lush: "#43a047",
  // Star colours.
  Yellow: "#fbc02d",
  Red: "#e53935",
  Green: "#43a047",
  Blue: "#1e88e5",
  Purple: "#8e24aa",
  // Populations and stations.
  Gek: "#558b2f",
  "Vy'keen": "#bf360c",
  Korvax: "#0277bd",
  Uncharted: "#757575",
  Inhabited: "#2e7d32",
  Abandoned: "#a1887f",
};

// For what has no colour of its own.
const NEXT = [
  "#1976d2",
  "#00897b",
  "#8e24aa",
  "#c2185b",
  "#5d4037",
  "#00838f",
  "#757575",
  "#f9a825",
];

export function colorOf(label: string, at: number) {
  return NAMED[label] ?? NEXT[at % NEXT.length];
}

export function isNamed(label: string) {
  return label in NAMED;
}
