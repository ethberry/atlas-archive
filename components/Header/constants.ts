import { EnabledLanguages } from "@/lib/i18n";

// Header constants
export const DISCORD_LINK = "https://minisite.uno/discordfractown";

// Shared button styles
export const BUTTON_BASE_CLASSES =
  "flex items-center gap-2 border-2 text-white px-4 py-2 rounded-[12px] transition-all duration-300 font-sans";

export const BUTTON_GRADIENT_CLASSES =
  "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-transparent hover:border-[#262957] hover:from-transparent hover:to-transparent";

export const BUTTON_ACTIVE_CLASSES =
  "from-transparent to-transparent border-[#262957]";

// Language options
export const LANGUAGE_OPTIONS: Array<{
  value: EnabledLanguages;
  label: string;
}> = [
  { value: EnabledLanguages.EN, label: "Eng" },
  { value: EnabledLanguages.RU, label: "Rus" },
];
