"use client";

import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useRef,
  useEffect,
} from "react";
import { useStore } from "zustand";

import {
  type TAppStore,
  createAppStore,
  initAppStore,
  LANGUAGE_STORAGE_KEY,
} from "@/lib/stores/store";
import { EnabledLanguages } from "@/lib/i18n";

export type AppStoreApi = ReturnType<typeof createAppStore>;

export const AppStoreContext = createContext<AppStoreApi | undefined>(
  undefined,
);

export const AppStoreProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const storeRef = useRef<AppStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createAppStore(initAppStore());
  }

  // Restore language from localStorage on client mount
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (
      stored &&
      Object.values(EnabledLanguages).includes(stored as EnabledLanguages)
    ) {
      storeRef.current?.getState().setLanguage(stored as EnabledLanguages);
    }
  }, []);

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = <T,>(selector: (store: TAppStore) => T): T => {
  const appStoreContext = useContext(AppStoreContext);

  if (!appStoreContext) {
    throw new Error(`useAppStore must be used within AppStoreProvider`);
  }

  return useStore(appStoreContext, selector);
};
