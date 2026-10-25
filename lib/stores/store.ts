import { createStore } from "zustand/vanilla";

import { EnabledLanguages } from "@/lib/i18n";

export interface IAppState {
  language: EnabledLanguages;
}

export interface IAppActions {
  setLanguage: (language: EnabledLanguages) => void;
}

export type TAppStore = IAppState & IAppActions;

export const LANGUAGE_STORAGE_KEY = "atlas-archive-language";

export const getBrowserLanguage = (): EnabledLanguages => {
  if (
    typeof window === "undefined" ||
    typeof window.navigator === "undefined"
  ) {
    return EnabledLanguages.EN;
  }

  const browserLang = window.navigator.language.toLowerCase();

  // Check if browser language is Russian
  if (browserLang.startsWith("ru")) {
    return EnabledLanguages.RU;
  }

  // Default to English for all other languages
  return EnabledLanguages.EN;
};

export const initAppStore = (): IAppState => {
  if (typeof window === "undefined") {
    return { language: EnabledLanguages.EN };
  }

  // Check if user has previously selected a language
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (
    savedLanguage &&
    Object.values(EnabledLanguages).includes(savedLanguage as EnabledLanguages)
  ) {
    return { language: savedLanguage as EnabledLanguages };
  }

  // If no saved language, detect from browser
  return { language: getBrowserLanguage() };
};

export const defaultInitState: IAppState = {
  language: EnabledLanguages.EN,
};

export const createAppStore = (initState: IAppState = defaultInitState) => {
  return createStore<TAppStore>()((set) => ({
    ...initState,
    setLanguage: (language: EnabledLanguages) => {
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      }
      set(() => ({ language }));
    },
  }));
};
