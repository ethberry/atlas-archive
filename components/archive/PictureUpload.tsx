"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useDropzone } from "react-dropzone";
import { FormattedMessage, useIntl } from "react-intl";

import { useAuth } from "@/components/providers/AuthProvider";
import { shrinkPicture } from "@/lib/archive/shrink";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

// The file as dropped; it is shrunk to the 1 MB of the bucket before upload.
const MAX_BYTES = 30 * 1024 * 1024;
const TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

// A player's screenshot of an item: one per player, and a new file replaces
// the old one. It shows on the site once the owner has checked it.
export function PictureUpload(props: {
  assetId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { assetId, open, onClose } = props;
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const supabase = getBrowserSupabase();
      if (!supabase || !user) {
        throw new Error(intl.formatMessage({ id: "archive.unavailable" }));
      }
      const picture = await shrinkPicture(file);
      const name = picture.type === "image/webp" ? "webp" : "jpg";
      const path = `${assetId}/${user.id}/${crypto.randomUUID()}.${name}`;
      const stored = await supabase.storage
        .from("screenshots")
        .upload(path, picture, { contentType: picture.type });
      if (stored.error) {
        throw new Error(intl.formatMessage({ id: "archive.uploadFailed" }));
      }
      const { data: old } = await supabase
        .from("asset_images")
        .select("object_path")
        .eq("asset_id", assetId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (old) {
        await supabase
          .from("asset_images")
          .delete()
          .eq("asset_id", assetId)
          .eq("user_id", user.id);
        await supabase.storage.from("screenshots").remove([old.object_path]);
      }
      const row = await supabase
        .from("asset_images")
        .insert({ asset_id: assetId, user_id: user.id, object_path: path });
      if (row.error) {
        await supabase.storage.from("screenshots").remove([path]);
        throw new Error(intl.formatMessage({ id: "archive.uploadFailed" }));
      }
    },
    onSuccess: () => {
      enqueueSnackbar(intl.formatMessage({ id: "archive.uploadDone" }), {
        variant: "success",
      });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: "error" });
    },
  });

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: browse,
  } = useDropzone({
    accept: TYPES,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    multiple: false,
    noClick: true,
    disabled: upload.isPending,
    onDropAccepted: ([file]) => upload.mutate(file),
    onDropRejected: () => {
      enqueueSnackbar(intl.formatMessage({ id: "archive.uploadRejected" }), {
        variant: "error",
      });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <FormattedMessage id="archive.uploadTitle" />
      </DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "divider",
            borderRadius: 1,
          }}
        >
          <input {...getInputProps()} />
          <Typography gutterBottom>
            <FormattedMessage id="archive.uploadDrop" />
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <FormattedMessage id="archive.uploadHint" />
          </Typography>
          <Button onClick={browse} disabled={upload.isPending}>
            <FormattedMessage id="archive.uploadBrowse" />
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
