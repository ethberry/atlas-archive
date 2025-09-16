import { PropsWithChildren, ReactElement } from "react";
import { IntlProvider } from "react-intl";

import { flattenMessages } from "./utils";

interface ILocalizationProviderProps<T extends string> {
  i18n: Record<T, any>;
  defaultLanguage: T;
}

export const LocalizationProvider = <T extends string>(
  props: PropsWithChildren<ILocalizationProviderProps<T>>,
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
