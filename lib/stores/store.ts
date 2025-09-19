import { createStore } from "zustand/vanilla";

import { EnabledLanguages } from "@/lib/i18n";

export interface IAppState {
  language: EnabledLanguages;
}

export interface IAppActions {
  setLanguage: (language: EnabledLanguages) => void;
}

export type TAppStore = IAppState & IAppActions;

export const initAppStore = (): IAppState => {
  return { language: EnabledLanguages.EN };
};

export const defaultInitState: IAppState = {
  language: EnabledLanguages.EN,
};

export const createAppStore = (initState: IAppState = defaultInitState) => {
  return createStore<TAppStore>()((set) => ({
    ...initState,
    setLanguage: (language: EnabledLanguages) => set(() => ({ language })),
  }));
};
