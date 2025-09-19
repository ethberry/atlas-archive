import { PropsWithChildren, ReactElement } from "react";
import { IntlProvider } from "react-intl";

import { useAppStore } from "@/components/providers/store";
import { EnabledLanguages } from "@/lib/i18n";

import { flattenMessages } from "./utils";

interface ILocalizationProviderProps {
  i18n: Record<EnabledLanguages, any>;
  defaultLanguage: EnabledLanguages;
}

export const LocalizationProvider = (
  props: PropsWithChildren<ILocalizationProviderProps>,
): ReactElement | null => {
  const { children, i18n, defaultLanguage } = props;

  const { language } = useAppStore((state) => state);

  return (
    <IntlProvider
      defaultLocale={defaultLanguage}
      locale={language}
      messages={flattenMessages(i18n[language])}
    >
      {children}
    </IntlProvider>
  );
};
