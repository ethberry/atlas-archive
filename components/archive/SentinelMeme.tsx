"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

// A Claim button whose every answer is no, a random one each press.
const ANSWERS = [
  "No.",
  "Also no.",
  "Nice try.",
  "The Sentinels disagree.",
  "The Atlas disagrees.",
  "Hello Games disagrees.",
  "Your wife says no.",
  "Nada has seen this before. Nada says no.",
  "Artemis asked for you. The answer was still no.",
  "Apollo ran the numbers. All of them are no.",
  "Null says this is the one thing the simulation got right.",
  "The Priest Entity has prayed on it. No.",
  "A Gek merchant offered // 16 // units. The Sentinels laughed.",
  "A Vy'keen tried this once. We do not speak of him.",
  "The Korvax calculated your odds. They rounded down to zero.",
  "Wanted level: ★★★★★",
  "Have you tried asking nicely? Still no.",
  "This ship is not for sale. Or for anything.",
  "Your Interceptor called. It says no.",
  "Request denied by the Atlas, the Sentinels, and everyone else.",
  "Claim rejected. Please enjoy your cannon fire.",
  "CRITICAL ERROR: ambition exceeds simulation.",
  "Error 404: captain not found.",
  "The Sentinels have filed a complaint.",
  "You need a Sentinel Pass. Nobody has a Sentinel Pass.",
  "Polo laughed. Nada did not.",
  "The ship has read your reviews. No.",
  "Please hold. Your call is important to no one.",
  "Insufficient nanites. Also insufficient permission. Also no.",
  "That is not how any of this works.",
  "The Anomaly voted. It was unanimous.",
  "Try again in another simulation.",
];

export function SentinelMeme() {
  const [press, setPress] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Button
        variant="contained"
        onClick={() => {
          // Never the same answer twice in a row.
          const next = Math.floor(Math.random() * (ANSWERS.length - 1));
          setAnswer(next >= answer ? next + 1 : next);
          setPress(press + 1);
          setOpen(true);
        }}
      >
        Claim
      </Button>
      <Snackbar
        key={press}
        open={open}
        autoHideDuration={2500}
        onClose={(_event, reason) => {
          if (reason !== "clickaway") {
            setOpen(false);
          }
        }}
        message={ANSWERS[answer]}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
