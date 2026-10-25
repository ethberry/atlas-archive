import { PropsWithChildren, ReactElement } from "react";
import { IntlProvider } from "react-intl";

import { EnabledLanguages, type NestedMessages } from "@/lib/i18n";

import { flattenMessages } from "./utils";

interface ILocalizationProviderProps {
  i18n: Record<EnabledLanguages, NestedMessages>;
  defaultLanguage: EnabledLanguages;
}

export const LocalizationProvider = (
  props: PropsWithChildren<ILocalizationProviderProps>,
): ReactElement | null => {
  const { children, i18n, defaultLanguage } = props;

  return (
    <IntlProvider
      defaultLocale={defaultLanguage}
      locale={defaultLanguage}
      messages={flattenMessages(i18n[defaultLanguage])}
    >
      {children}
    </IntlProvider>
  );
};
