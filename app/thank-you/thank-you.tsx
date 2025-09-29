"use client";

import { FC } from "react";
import { FormattedMessage } from "react-intl";

export const ThankYou: FC = () => {
  return (
    <main className="flex-row justify-center text-center max-w-[800px] mx-[30px] mobile:mx-auto space-y-8">
      <h2>
        <FormattedMessage id="pages.saft.title" />
      </h2>
    </main>
  );
};
