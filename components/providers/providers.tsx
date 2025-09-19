"use client";

import { PropsWithChildren } from "react";
import { SnackbarProvider } from "notistack";

import { EnabledLanguages, i18n } from "@/lib/i18n";
import { AppStoreProvider } from "@/components/providers/store";

import { LocalizationProvider } from "./localization";
import { ReactQueryClientProvider } from "./ReactQueryClientProvider";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryClientProvider>
      <AppStoreProvider>
        <LocalizationProvider i18n={i18n} defaultLanguage={EnabledLanguages.EN}>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            autoHideDuration={3000}
          >
            {children}
          </SnackbarProvider>
        </LocalizationProvider>
      </AppStoreProvider>
    </ReactQueryClientProvider>
  );
};
