"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import GoogleIcon from "@mui/icons-material/Google";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { User } from "@supabase/supabase-js";
import { useSnackbar } from "notistack";
import { FormattedMessage } from "react-intl";

import { getBrowserSupabase } from "@/lib/db/supabase.browser";

type AuthContextValue = {
  user: User | null;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      return;
    }
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, open, setOpen }), [user, open]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthDrawer />
    </AuthContext.Provider>
  );
}

function AuthDrawer() {
  const { user, open, setOpen } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  async function signIn() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      enqueueSnackbar("The archive could not be read.", { variant: "error" });
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  }

  async function signOut() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      enqueueSnackbar(error.message, { variant: "error" });
      return;
    }
    setOpen(false);
  }

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <Stack spacing={2} sx={{ width: 320, p: 3 }}>
        <Typography variant="h6">
          <FormattedMessage id="archive.authTitle" />
        </Typography>
        {user ? (
          <>
            <Typography color="text.secondary">{user.email}</Typography>
            <Button variant="outlined" onClick={() => void signOut()}>
              <FormattedMessage id="archive.signOut" />
            </Button>
          </>
        ) : (
          <Box>
            <Button
              variant="contained"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={() => void signIn()}
            >
              <FormattedMessage id="archive.continueWithGoogle" />
            </Button>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
