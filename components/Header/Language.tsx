"use client";

import { FC, useState, useCallback, memo, useMemo } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnabledLanguages } from "@/lib/i18n";
import { useAppStore } from "@/components/providers/AppStoreProvider";
import {
  LANGUAGE_OPTIONS,
  BUTTON_BASE_CLASSES,
  BUTTON_GRADIENT_CLASSES,
  BUTTON_ACTIVE_CLASSES,
} from "@/lib/constants";

import { ChevronIcon } from "./icons/ChevronIcon";

export const Language: FC = memo(() => {
  const { language, setLanguage } = useAppStore((state) => state);
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguageLabel = useMemo(
    () =>
      LANGUAGE_OPTIONS.find((opt) => opt.value === language)?.label || "Eng",
    [language],
  );

  const handleLanguageChange = useCallback(
    (newLanguage: EnabledLanguages) => {
      setLanguage(newLanguage);
      setIsOpen(false);
    },
    [setLanguage],
  );

  const triggerClasses = useMemo(
    () =>
      `hidden md:${BUTTON_BASE_CLASSES} max-w-[80px] ${
        isOpen
          ? `${BUTTON_ACTIVE_CLASSES} border-b-0 rounded-b-none`
          : BUTTON_GRADIENT_CLASSES
      }`,
    [isOpen],
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={triggerClasses}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span>{currentLanguageLabel}</span>
        <ChevronIcon />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="bg-transparent border-2 border-[#262957] border-t-0 rounded-[12px] rounded-t-none min-w-[80px] max-w-[80px] w-full -mt-2 px-0 outline-none"
        align="end"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            className="text-white bg-transparent hover:!bg-[#262957] rounded-none px-4 cursor-pointer"
            aria-label={`Switch to ${option.label}`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
