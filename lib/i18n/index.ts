import en from "./en.json";
import ru from "./ru.json";

export enum EnabledLanguages {
  EN = "EN",
  RU = "RU",
}

export const i18n: Record<EnabledLanguages, any> = {
  [EnabledLanguages.EN]: en,
  [EnabledLanguages.RU]: ru,
};
