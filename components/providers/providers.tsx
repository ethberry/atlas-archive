"use client";

import { PropsWithChildren } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";

import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { AppStoreProvider } from "@/components/providers/AppStoreProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import { ReactQueryClientProvider } from "@/components/providers/ReactQueryClientProvider";
import { theme } from "@/components/providers/theme";
import { EnabledLanguages, i18n } from "@/lib/i18n";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryClientProvider>
      <AppStoreProvider>
        <AppRouterCacheProvider options={{ key: "css", enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider
              i18n={i18n}
              defaultLanguage={EnabledLanguages.EN}
            >
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                autoHideDuration={3000}
              >
                <AuthProvider>
                  <ArchiveShell>{children}</ArchiveShell>
                </AuthProvider>
              </SnackbarProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </AppStoreProvider>
    </ReactQueryClientProvider>
  );
};
