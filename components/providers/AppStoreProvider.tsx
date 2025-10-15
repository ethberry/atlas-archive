"use client";

import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useRef,
} from "react";
import { useStore } from "zustand";

import {
  type TAppStore,
  createAppStore,
  initAppStore,
} from "@/lib/stores/store";

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
