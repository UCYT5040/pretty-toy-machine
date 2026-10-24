import { drag } from "./components/drag";
import { physics } from "./components/physics";
import { planet } from "./components/planet";
import { k } from "./kaplayCtx";
import { loadNotoEmoji } from "./loadNotoEmoji";

loadNotoEmoji("soccer", "⚽");
loadNotoEmoji("earth", "🌍");
loadNotoEmoji("rocket", "🚀");

k.setGravity(1200);

k.add([
  k.sprite("earth"),
  k.anchor("center"),
  k.area(),
  k.pos(100, 100),
  drag(),
  planet(),
  physics(k.vec2(0, 0), 1000),
  "solid",
]);

k.add([
  k.sprite("soccer"),
  k.anchor("center"),
  k.area(),
  k.pos(500, 100),
  drag(),
  physics(),
  k.scale(0.5, 0.5),
  "solid",
]);

/* Floor */
k.add([
  k.area(),
  k.rect(k.width(), 40),
  k.pos(0, k.height() - 40),
  k.area(),
  k.color(80, 80, 80),
  "solid",
]);
