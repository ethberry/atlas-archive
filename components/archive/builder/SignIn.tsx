import { useEffect, useRef } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { FormattedMessage } from "react-intl";

import { useAuth } from "@/components/providers/AuthProvider";

// One Tap on the click, and a Google button beside it for when One Tap refuses.
export function SignIn() {
  const { promptSignIn, renderSignIn } = useAuth();
  const button = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (button.current) {
      void renderSignIn(button.current);
    }
    void promptSignIn();
  }, [promptSignIn, renderSignIn]);

  return (
    <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
      <Alert severity="info" sx={{ alignSelf: "stretch" }}>
        <FormattedMessage id="archive.finderSignIn" />
      </Alert>
      <div ref={button} />
    </Stack>
  );
}
