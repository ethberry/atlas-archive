"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useIntl } from "react-intl";

import { useAuth } from "@/components/providers/AuthProvider";
import { LIKABLE, type Kind } from "@/lib/archive/kinds";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

export function LikeButton(props: { id: string; kind: Kind; liked: boolean }) {
  const { id, kind, liked } = props;
  const { user, setOpen } = useAuth();
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

  return (
    <IconButton
      aria-label={intl.formatMessage({
        id: liked ? "archive.unlike" : "archive.like",
      })}
      color={liked ? "error" : "default"}
      disabled={mutation.isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!user) {
          setOpen(true);
          return;
        }
        mutation.mutate();
      }}
    >
      {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  );
}
