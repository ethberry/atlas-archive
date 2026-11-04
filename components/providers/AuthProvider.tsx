"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import type { User } from "@supabase/supabase-js";
import { useSnackbar } from "notistack";
import { useIntl } from "react-intl";

import { getBrowserSupabase } from "@/lib/db/supabase.browser";

type AuthContextValue = {
  user: User | null;
  signOut: () => Promise<void>;
  promptSignIn: () => Promise<void>;
  renderSignIn: (element: HTMLElement) => Promise<void>;
};

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            nonce?: string;
            use_fedcm_for_prompt?: boolean;
            itp_support?: boolean;
            auto_select?: boolean;
            context?: "signin" | "signup" | "use";
          }) => void;
          prompt: () => void;
          cancel: () => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; text?: string },
          ) => void;
        };
      };
    };
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const promptDelayMs = 3000;

function showGooglePrompt() {
  window.google?.accounts.id.prompt();
}

async function generateNonce(): Promise<[string, string]> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return [nonce, hashedNonce];
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const nonceRef = useRef<string | null>(null);
  const initializeRef = useRef<Promise<void> | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const router = useRouter();

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      return;
    }
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setSessionChecked(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        enqueueSnackbar(intl.formatMessage({ id: "archive.unavailable" }), {
          variant: "error",
        });
        return;
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        nonce: nonceRef.current ?? undefined,
      });
      if (error) {
        enqueueSnackbar(error.message, { variant: "error" });
        return;
      }
      router.refresh();
    },
    [enqueueSnackbar, intl, router],
  );

  const signInWithCredentialRef = useRef(signInWithCredential);
  useEffect(() => {
    signInWithCredentialRef.current = signInWithCredential;
  }, [signInWithCredential]);

  const ensureGoogle = useCallback(async () => {
    if (!googleClientId || !window.google) {
      return false;
    }
    if (!initializeRef.current) {
      initializeRef.current = (async () => {
        const [nonce, hashedNonce] = await generateNonce();
        nonceRef.current = nonce;
        window.google?.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            void signInWithCredentialRef.current(response);
          },
          nonce: hashedNonce,
          context: "signin",
          auto_select: false,
          itp_support: true,
          use_fedcm_for_prompt: true,
        });
      })();
    }
    await initializeRef.current;
    return true;
  }, []);

  useEffect(() => {
    if (!scriptReady || !sessionChecked || user) {
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void ensureGoogle().then((ready) => {
        if (!cancelled && ready) {
          showGooglePrompt();
        }
      });
    }, promptDelayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ensureGoogle, scriptReady, sessionChecked, user]);

  const signOut = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      enqueueSnackbar(error.message, { variant: "error" });
      return;
    }
    router.refresh();
  }, [enqueueSnackbar, router]);

  const promptSignIn = useCallback(async () => {
    if (await ensureGoogle()) {
      showGooglePrompt();
    }
  }, [ensureGoogle]);

  // One Tap may refuse: a cooldown after a dismissal, or the prompt already open.
  // A button always works.
  const renderSignIn = useCallback(
    async (element: HTMLElement) => {
      if (await ensureGoogle()) {
        window.google?.accounts.id.renderButton(element, {
          theme: "outline",
          size: "large",
          text: "signin_with",
        });
      }
    },
    [ensureGoogle],
  );

  const value = useMemo(
    () => ({ user, signOut, promptSignIn, renderSignIn }),
    [user, signOut, promptSignIn, renderSignIn],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => {
            setScriptReady(true);
          }}
        />
      ) : null}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
