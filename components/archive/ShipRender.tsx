"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// A ship drawn whole from the game's own model files, on a dark ground in both
// themes, as space is. Width and height are set so the page does not jump.
const RENDERS = {
  dreadnought: {
    src: "/render/dreadnought.webp",
    width: 1600,
    height: 816,
    alt: "The pirate dreadnought of No Man's Sky: a long dark grey hull with red lights, gun turrets on its deck, and long spires hanging below",
    caption: "The pirate dreadnought, drawn from the game's own model.",
  },
  dreadnoughtShields: {
    src: "/render/dreadnought-shields.webp",
    width: 1600,
    height: 840,
    alt: "The pirate dreadnought seen from above, bow to the right: ten shield generators marked in red, five in each of the two trenches that run along its deck",
    caption:
      "Shield generators in red: five in each trench, shown through the arches that cover them.",
  },
  dreadnoughtEngines: {
    src: "/render/dreadnought-engines.webp",
    width: 1600,
    height: 1216,
    alt: "The pirate dreadnought seen from behind: its four engines marked in red, in a row low at the stern",
    caption: "The four engines in red, in a row at the stern.",
  },
  dreadnoughtCannons: {
    src: "/render/dreadnought-cannons.webp",
    width: 1600,
    height: 840,
    alt: "The pirate dreadnought seen from above, bow to the right: six large cannons marked in red along the middle of the deck, five on the raised deck at the stern and one at the bow",
    caption:
      "The six large cannons in red: five on the stepped deck at the stern, one at the bow.",
  },
  sentinel: {
    src: "/render/sentinel.webp",
    width: 1600,
    height: 744,
    alt: "The Sentinel capital ship of No Man's Sky: a long white and grey hull trimmed in orange, with engines at the stern, turrets along its side, and round cargo pods hanging under the hull",
    caption: "The Sentinel capital ship, drawn from the game's own model.",
  },
  sentinelShields: {
    src: "/render/sentinel-shields.webp",
    width: 1600,
    height: 1424,
    alt: "The Sentinel capital ship seen from above and behind, stern to the left: four round shield generators marked in red, two on each side, one pair just ahead of the engines and one pair just behind the bow; the cargo pods under the hull are not marked",
    caption:
      "The four shield generators in red, two on each side; the far pair is shown through the hull. The round pods under the hull are cargo pods.",
  },
} as const;

export function ShipRender(props: { ship: keyof typeof RENDERS }) {
  const render = RENDERS[props.ship];
  return (
    <Box component="figure" sx={{ m: 0 }}>
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          background:
            "radial-gradient(ellipse at 50% 40%, #3b4452 0%, #1f242c 70%, #161a20 100%)",
          p: { xs: 1, sm: 2 },
        }}
      >
        <Box
          component="img"
          src={render.src}
          alt={render.alt}
          width={render.width}
          height={render.height}
          loading={
            props.ship === "dreadnought" || props.ship === "sentinel"
              ? "eager"
              : "lazy"
          }
          decoding="async"
          sx={{ display: "block", width: "100%", height: "auto" }}
        />
      </Box>
      <Typography
        component="figcaption"
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.75 }}
      >
        {render.caption}
      </Typography>
    </Box>
  );
}

export function DreadnoughtRender() {
  return <ShipRender ship="dreadnought" />;
}

export function DreadnoughtShields() {
  return <ShipRender ship="dreadnoughtShields" />;
}

export function DreadnoughtEngines() {
  return <ShipRender ship="dreadnoughtEngines" />;
}

export function DreadnoughtCannons() {
  return <ShipRender ship="dreadnoughtCannons" />;
}

export function SentinelRender() {
  return <ShipRender ship="sentinel" />;
}

export function SentinelShields() {
  return <ShipRender ship="sentinelShields" />;
}
