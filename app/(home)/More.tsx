"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export const LearnMore: FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/saft");
  };

  return (
    <section className="">
      <Button onClick={handleClick}>Learn More</Button>
    </section>
  );
};
