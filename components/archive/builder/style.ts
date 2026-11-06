// One calm surface for the ship and the tiles of a builder, in either theme.
export const SURFACE = "#e7e8ea";
export const INK = "#1d2026";
export const MARK = "#c8561b";

export const TILE = {
  flexDirection: "column",
  gap: 0.5,
  width: 132,
  bgcolor: "#f4f4f5",
  color: INK,
  border: "1px solid #c4c7cc !important",
  "&:hover": { bgcolor: "#f4f4f5", borderColor: "#8c9096 !important" },
  "&.Mui-selected, &.Mui-selected:hover": {
    bgcolor: "#f4f4f5",
    color: INK,
    outline: `3px solid ${MARK}`,
    outlineOffset: -1,
  },
  "&.Mui-disabled": { color: "#70747b", opacity: 0.55 },
};
