import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { useIntl } from "react-intl";

export const Logo: FC = () => {
  const { formatMessage } = useIntl();
  return (
    <Link href="/">
      <Image
        width={128}
        height={20}
        src="/assets/fractown-logo.png"
        alt={formatMessage({ id: "components.header.logo" })}
        className="w-32 h-full"
      />
    </Link>
  );
};
