import en from "./en.json";

export enum EnabledLanguages {
  EN = "EN",
}

export const i18n: Record<EnabledLanguages, any> = {
  [EnabledLanguages.EN]: en,
};
