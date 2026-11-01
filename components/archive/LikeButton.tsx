"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useIntl } from "react-intl";

import { useAuth } from "@/components/providers/AuthProvider";
import { LIKABLE, type Kind } from "@/lib/archive/kinds";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

// The heart: empty or pink, with the number of likes beside it.
export function LikeButton(props: {
  id: string;
  kind: Kind;
  liked: boolean;
  count: number;
}) {
  const { id, kind, liked, count } = props;
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = getBrowserSupabase();
      if (!supabase || !user) {
        throw new Error(intl.formatMessage({ id: "archive.unavailable" }));
      }
      const result = liked
        ? await supabase
            .from("likes")
            .delete()
            .eq("asset_id", id)
            .eq("user_id", user.id)
        : await supabase
            .from("likes")
            .insert({ asset_id: id, user_id: user.id });
      if (result.error) {
        throw new Error(intl.formatMessage({ id: "archive.unavailable" }));
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      await queryClient.invalidateQueries({ queryKey: ["item-tabs"] });
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      await queryClient.invalidateQueries({ queryKey: ["record", kind, id] });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: "error" });
    },
  });

  if (!LIKABLE.has(kind)) {
    return null;
  }

  const label = intl.formatMessage({
    id: liked ? "archive.unlike" : "archive.like",
  });
  return (
    <Stack direction="row" sx={{ alignItems: "center" }}>
      <Tooltip title={label}>
        <span style={{ cursor: user ? undefined : "not-allowed" }}>
          <IconButton
            aria-label={label}
            sx={{ color: liked ? "#e91e63" : undefined }}
            disabled={!user || mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              mutation.mutate();
            }}
          >
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </span>
      </Tooltip>
      <Typography color="text.secondary">{count}</Typography>
    </Stack>
  );
}
