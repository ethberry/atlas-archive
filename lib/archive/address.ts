// A body's locator is its packed galactic address, sixteen hex digits:
// 00, body, system (3), galaxy (2), Y (2), Z (3), X (3). The portal shows the
// same digits without the galaxy byte, body first: twelve glyphs, one per hex
// digit, in the order of the portal keypad (0 Sunset ... F Atlas).

const PACKED = /^[0-9a-f]{16}$/i;

export function portalGlyphs(locator: string | null): string | null {
  if (!locator || !PACKED.test(locator)) {
    return null;
  }
  const digits = locator.toUpperCase();
  return digits.slice(2, 6) + digits.slice(8, 16);
}

export function galaxyIndex(locator: string | null): number | null {
  if (!locator || !PACKED.test(locator)) {
    return null;
  }
  return parseInt(locator.slice(6, 8), 16);
}
