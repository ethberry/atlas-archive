import en from "./en.json";
import ru from "./ru.json";

export enum EnabledLanguages {
  EN = "EN",
  RU = "RU",
}

export type NestedMessages = {
  [key: string]: string | NestedMessages;
};

export const i18n: Record<EnabledLanguages, NestedMessages> = {
  [EnabledLanguages.EN]: en,
  [EnabledLanguages.RU]: ru,
};
