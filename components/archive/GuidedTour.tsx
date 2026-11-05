"use client";

import { useEffect, useId, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FormattedMessage } from "react-intl";

import { FINDER_MESSAGE } from "@/lib/archive/features";

const SEEN = "atlas-tour-about";
const CRAWLER = /bot|crawl|spider|slurp/i;
const FIRST_RUN_DELAY = 600;
const CARD_WIDTH = 320;
const CARD_HEIGHT = 190;
const GAP = 16;
const EDGE = 12;
const PAD = 6;
// Clear of the donation button in the corner of the screen.
const PHONE_BOTTOM = 84;

type Step = {
  // The `data-tour` of what the step lights.
  target: string;
  id: string;
  // The target lies in the drawer on a narrow screen, so the step lights the
  // drawer's button.
  inMenu?: boolean;
  // Every match counts; otherwise the first on the page.
  all?: boolean;
};

const STEPS: Step[] = [
  { target: "switch", id: "Switch" },
  { target: "browse", id: "Encyclopedia", inMenu: true },
  { target: "statistics", id: "Statistics", inMenu: true },
  { target: "tools", id: "Tools", inMenu: true, all: true },
];

type Box4 = { top: number; left: number; width: number; height: number };

function visible(name: string) {
  const found = document.querySelectorAll(`[data-tour="${name}"]`);
  return [...found].filter((row) => row.getClientRects().length > 0);
}

function targetsOf(step: Step) {
  const found = visible(step.target);
  if (found.length > 0) {
    return step.all ? found : found.slice(0, 1);
  }
  return step.inMenu ? visible("menu") : [];
}

// The box around `rows`, with room to breathe.
function around(rows: Element[]): Box4 {
  const boxes = rows.map((row) => row.getBoundingClientRect());
  const top = Math.min(...boxes.map((row) => row.top)) - PAD;
  const left = Math.min(...boxes.map((row) => row.left)) - PAD;
  const right = Math.max(...boxes.map((row) => row.right)) + PAD;
  const bottom = Math.max(...boxes.map((row) => row.bottom)) + PAD;
  return { top, left, width: right - left, height: bottom - top };
}

// Under the target when it fits there, otherwise above it, never off the screen.
function cardPlace(spot: Box4) {
  const below = spot.top + spot.height + GAP;
  const fits = below + CARD_HEIGHT < window.innerHeight;
  const top = fits ? below : Math.max(EDGE, spot.top - GAP - CARD_HEIGHT);
  const wanted = spot.left + spot.width / 2 - CARD_WIDTH / 2;
  const widest = window.innerWidth - CARD_WIDTH - EDGE;
  return { top, left: Math.max(EDGE, Math.min(wanted, widest)) };
}

function seen() {
  try {
    return localStorage.getItem(SEEN) !== null;
  } catch {
    return true;
  }
}

function remember() {
  try {
    localStorage.setItem(SEEN, "1");
  } catch {
    // The tour comes back on the next visit.
  }
}

export function GuidedTour() {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down("sm"));
  const titleId = useId();
  const textId = useId();
  const [steps, setSteps] = useState<Step[]>([]);
  const [at, setAt] = useState(0);
  const [spot, setSpot] = useState<Box4 | null>(null);
  const scrolled = useRef(0);
  const open = steps.length > 0;
  const step = steps[at];
  const usesMenu = open && visible(step.target).length === 0;

  const start = () => {
    const ready = STEPS.filter((row) => targetsOf(row).length > 0);
    scrolled.current = window.scrollY;
    remember();
    setSpot(null);
    setAt(0);
    setSteps(ready);
  };

  const close = () => {
    setSteps([]);
    window.scrollTo({ top: scrolled.current, behavior: "instant" });
  };

  useEffect(() => {
    if (seen() || CRAWLER.test(navigator.userAgent)) {
      return undefined;
    }
    const timer = setTimeout(start, FIRST_RUN_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!step) {
      return undefined;
    }
    const measure = () => {
      const rows = targetsOf(step);
      if (rows.length > 0) {
        setSpot(around(rows));
      }
    };
    // The header stays in view, so its steps leave the page where it is.
    const first = targetsOf(step)[0];
    const edge = first?.getBoundingClientRect();
    if (edge && (edge.top < 0 || edge.bottom > window.innerHeight)) {
      first.scrollIntoView({ block: "center", behavior: "instant" });
    }
    const frame = requestAnimationFrame(measure);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [step]);

  const place = spot && !phone ? cardPlace(spot) : null;

  return (
    <>
      <Button size="small" onClick={start} sx={{ alignSelf: "flex-start" }}>
        <FormattedMessage id="archive.tourStart" />
      </Button>
      <Modal
        open={open}
        onClose={close}
        hideBackdrop
        disableScrollLock
        aria-labelledby={titleId}
        aria-describedby={textId}
      >
        <Box sx={{ position: "fixed", inset: 0, outline: 0 }}>
          {spot ? (
            <Box
              sx={{
                position: "fixed",
                ...spot,
                borderRadius: 1,
                boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.6)",
                outline: "2px solid #fff",
                pointerEvents: "none",
                transition: "all 0.2s ease",
              }}
            />
          ) : null}
          {step && spot ? (
            <Paper
              elevation={8}
              sx={{
                position: "fixed",
                p: 2,
                ...(place
                  ? { ...place, width: CARD_WIDTH }
                  : { left: EDGE, right: EDGE, bottom: PHONE_BOTTOM }),
              }}
            >
              <Stack spacing={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  aria-live="polite"
                >
                  <FormattedMessage
                    id="archive.tourCount"
                    values={{ at: at + 1, total: steps.length }}
                  />
                </Typography>
                <Typography id={titleId} variant="subtitle1" component="h2">
                  <FormattedMessage id={`archive.tour${step.id}Title`} />
                </Typography>
                <Typography id={textId} variant="body2">
                  <FormattedMessage
                    id={`archive.tour${step.id}${step.id === "Tools" ? FINDER_MESSAGE : ""}`}
                  />
                  {usesMenu ? (
                    <>
                      {" "}
                      <FormattedMessage id="archive.tourInMenu" />
                    </>
                  ) : null}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" color="inherit" onClick={close}>
                    <FormattedMessage id="archive.tourSkip" />
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    size="small"
                    disabled={at === 0}
                    onClick={() => setAt(at - 1)}
                  >
                    <FormattedMessage id="archive.tourBack" />
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    autoFocus
                    onClick={() =>
                      at + 1 < steps.length ? setAt(at + 1) : close()
                    }
                  >
                    <FormattedMessage
                      id={
                        at + 1 < steps.length
                          ? "archive.tourNext"
                          : "archive.tourDone"
                      }
                    />
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </Box>
      </Modal>
    </>
  );
}
