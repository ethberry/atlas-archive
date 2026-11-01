"use client";

import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { PictureUpload } from "@/components/archive/PictureUpload";
import { useAuth } from "@/components/providers/AuthProvider";

const FRAME = {
  display: "block",
  width: "100%",
  aspectRatio: "4 / 3",
  objectFit: "cover",
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
};

// The record's pictures. With one picture there is nothing to page through;
// with more, a swiper. A click opens them large over the page, and on an item
// the visitor can add a screenshot of their own.
export function PictureGallery(props: {
  id: string;
  name: string;
  images: string[];
  uploadable: boolean;
}) {
  const { id, name, images, uploadable } = props;
  const intl = useIntl();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [opened, setOpened] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const many = images.length > 1;

  function add() {
    if (user) {
      setAdding(true);
      return;
    }
    enqueueSnackbar(intl.formatMessage({ id: "archive.uploadSignIn" }), {
      variant: "info",
    });
  }

  return (
    <>
      {images.length === 0 ? (
        <Box
          component="img"
          src="/assets/img/no-image.svg"
          alt={name}
          onClick={uploadable ? add : undefined}
          sx={{ ...FRAME, cursor: uploadable ? "pointer" : "default" }}
        />
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={many}
          pagination={many ? { clickable: true } : false}
          style={{ width: "100%" }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={image}>
              <Box
                component="img"
                src={image}
                alt={name}
                onClick={() => setOpened(index)}
                sx={{ ...FRAME, cursor: "zoom-in" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {uploadable ? (
        <>
          <Button size="small" fullWidth onClick={add} sx={{ mt: 1 }}>
            <FormattedMessage id="archive.uploadTitle" />
          </Button>
          <PictureUpload
            assetId={id}
            open={adding}
            onClose={() => setAdding(false)}
          />
        </>
      ) : null}
      <Dialog
        open={opened !== null}
        onClose={() => setOpened(null)}
        fullWidth
        maxWidth="lg"
      >
        <IconButton
          aria-label={intl.formatMessage({ id: "archive.close" })}
          onClick={() => setOpened(null)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            color: "common.white",
            bgcolor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <CloseIcon />
        </IconButton>
        <Swiper
          modules={[Keyboard, Navigation, Pagination]}
          initialSlide={opened ?? 0}
          keyboard
          navigation={many}
          pagination={many ? { clickable: true } : false}
          style={{ width: "100%" }}
        >
          {images.map((image) => (
            <SwiperSlide key={image}>
              <Box
                component="img"
                src={image}
                alt={name}
                sx={{
                  display: "block",
                  width: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Dialog>
    </>
  );
}
