import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

export const Logo: FC = () => {
  return (
    <Link href="/">
      <Image
        width={128}
        height={20}
        src="/assets/fractown-logo.png"
        alt="Fractown Logo"
        className="w-32 h-full"
      />
    </Link>
  );
};
