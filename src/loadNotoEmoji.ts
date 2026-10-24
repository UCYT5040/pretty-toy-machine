import { k } from "./kaplayCtx";

export function loadNotoEmoji(spriteName: string, emoji: string) {
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0)!.toString(16))
    .filter((hex) => hex !== "fe0f")
    .join("_");

  const url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/2D/png/128/emoji_u${codePoints}.png`;

  return k.loadSprite(spriteName, url);
}
