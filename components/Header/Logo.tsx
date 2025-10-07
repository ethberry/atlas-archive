"use client";

import { FC, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useIntl } from "react-intl";

export const Logo: FC = memo(() => {
  const { formatMessage } = useIntl();

  return (
    <Link
      href="/"
      className="flex items-center transition-opacity hover:opacity-80"
      aria-label="Go to homepage"
    >
      <Image
        width={240}
        height={40}
        src="/assets/logo.png"
        alt={formatMessage({ id: "components.header.logo" })}
        className="w-[130px] md:w-[200px] h-auto"
        priority
      />
    </Link>
  );
});
