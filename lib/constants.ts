import { EnabledLanguages } from "./i18n";

export const DISCORD_LINK = "https://minisite.uno/discordfractown";
export const X_LINK = "https://minisite.uno/frac_townx";
export const TELEGRAM_LINK = "https://minisite.uno/coart_marketg";
export const FACEBOOK_LINK = "https://minisite.uno/coart-spacefb";
export const INSTAGRAM_LINK = "https://minisite.uno/coartmarketinst";
export const LINKEDIN_LINK = "https://minisite.uno/coartlinked";
export const TIKTOK_LINK = "https://minisite.uno/сoartaitt";
export const MEDIUM_LINK = "https://minisite.uno/coartmedium";

export const BUTTON_BASE_CLASSES =
  "flex items-center gap-2 border-2 text-white px-4 py-2 rounded-[12px] transition-all duration-300 font-sans";

export const BUTTON_GRADIENT_CLASSES =
  "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-transparent hover:border-[#262957] hover:from-transparent hover:to-transparent";

export const BUTTON_ACTIVE_CLASSES =
  "from-transparent to-transparent border-[#262957]";

export const LANGUAGE_OPTIONS: Array<{
  value: EnabledLanguages;
  label: string;
}> = [
  { value: EnabledLanguages.EN, label: "EN" },
  { value: EnabledLanguages.RU, label: "RU" },
];
