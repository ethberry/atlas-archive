"use client";

import { FC } from "react";

import { Logo } from "@/components/Header/Logo";
import { Language } from "@/components/Header/Language";
import { Discord } from "@/components/Header/Discord";

export const Header: FC = () => {
  return (
    <header className="w-full py-3 px-8 md:px-20 flex justify-between items-center">
      <Logo />
      <div className="flex items-center space-x-4">
        <Discord />
        <Language />
      </div>
    </header>
  );
};
