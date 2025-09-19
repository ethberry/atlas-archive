"use client";

import { FC } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/components/providers/store";
import { EnabledLanguages } from "@/lib/i18n";

export const Language: FC = () => {
  const { language, setLanguage } = useAppStore((state) => state);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Language ({language})</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setLanguage(EnabledLanguages.RU)}>
          RU
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage(EnabledLanguages.EN)}>
          EN
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
