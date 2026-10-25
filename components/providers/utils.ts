import { type NestedMessages } from "@/lib/i18n";

export function flattenMessages(
  nestedMessages: NestedMessages = {},
  prefix = "",
): Record<string, string> {
  return Object.keys(nestedMessages).reduce(
    (messages: Record<string, string>, key): Record<string, string> => {
      const value = nestedMessages[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        messages[prefixedKey] = value;
      } else {
        Object.assign(messages, flattenMessages(value, prefixedKey));
      }

      return messages;
    },
    {},
  );
}
