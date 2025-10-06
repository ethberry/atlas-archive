"use client";

import { FC, memo } from "react";
import { useIntl } from "react-intl";

import { DiscordIcon } from "./icons/DiscordIcon";
import {
  DISCORD_LINK,
  BUTTON_BASE_CLASSES,
  BUTTON_GRADIENT_CLASSES,
} from "./constants";

export const Discord: FC = memo(() => {
  const { formatMessage } = useIntl();

  return (
    <a
      href={DISCORD_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={formatMessage({ id: "components.header.discord" })}
      className={`hidden md:${BUTTON_BASE_CLASSES} ${BUTTON_GRADIENT_CLASSES}`}
    >
      <DiscordIcon />
      <span>{formatMessage({ id: "components.header.discord" })}</span>
    </a>
  );
});

Discord.displayName = "Discord";
