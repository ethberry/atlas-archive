import type { BakeLayer, Painted } from "@/lib/archive/builder/paint";
import type { Parts } from "@/lib/archive/builder/tree";
import type { ShipModule } from "@/lib/archive/builder/ship";

// The pictures of a builder in the browser, written by the ship's art script in
// crimson-orb (`utils/tools/ship_art`). Each layer of a ship's folder holds the
// shade in red and the depth, in one of three formats (`ShipModule.format`): a
// `textured` layer keeps eight bits of depth in green and, beside it in
// `<name>.uv.png`, where each pixel reads the paint texture, 8 bits of u in red and
// 16 of v in green and blue (`interceptor.py`); a `grey` layer keeps sixteen bits of
// depth in green and blue and reads no paint (`render.py`, the living ships); a
// `textured16` layer is a grey one with a deep `<name>.uv.png`, 12 bits of u and 12
// of v packed in red, green, and blue (`render.py` `deep_uv`, the freighters).

// The stage: the shade of each pixel and the group that stands there.
export type Stage = {
  shade: Uint8Array;
  group: Int8Array;
  // Where each pixel reads the paint texture; `textureU` 0 reads none. U runs 1 to
  // `uSteps` and V 0 to `vSteps`.
  textureU: Uint16Array;
  textureV: Uint16Array;
  uSteps: number;
  vSteps: number;
  width: number;
  height: number;
};

// No layer stands on the pixel.
export const HIDDEN = -2;

// The colour of a lit pixel that reads no texture: lights and glass. Our own
// choice.
const LENS = 34;

// The game's light on the page: a painted pixel is the baked texel times the
// shade times this, one constant for every builder. Measured in crimson-orb
// (docs/ships/living-ships.md, The light on the page): the median of the
// photo-to-bake ratio of the brightest channel, a 7 by 7 mean on a lit painted
// face of NMSCE photos against the baked band mean, over capital and regular
// freighters, Interceptors, and living ships (`GAME_LIGHT` in
// `utils/tools/ship_art/bake.py`).
const GAME_LIGHT = 1.3;

// How dark a black band leaves a tile or a grey ship, against a white one. Our own
// choice.
const TONE_FLOOR = 0.35;

// How much the open group outshines the rest on a painted ship. Our own choice.
const LIT = 1.25;

// The texture's coordinates of a `textured` layer: U in 1..255 (0 reads none), V over
// 16 bits; of a `textured16` layer (`DEEP_BITS` in `render.py`): U in 1..4095 (0
// reads none), V over 12 bits.
const TEXTURED = { uSteps: 254, vSteps: 65536 };
const DEEP = { uSteps: 4094, vSteps: 4096 };
// The bits of u in the red byte of a deep UV picture, and in the high half of green.
const DEEP_RED_SHIFT = 4;
const DEEP_LOW_MASK = 15;

async function imageOf(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(url);
  }
  const bitmap = await createImageBitmap(await response.blob(), {
    colorSpaceConversion: "none",
    premultiplyAlpha: "none",
  });
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("No canvas.");
  }
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

// A load that fails leaves the cache, so the next picture asks again.
function cached<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>,
) {
  let found = cache.get(key);
  if (!found) {
    found = load();
    found.catch(() => cache.delete(key));
    cache.set(key, found);
  }
  return found;
}

const images = new Map<string, Promise<ImageData>>();

// A layer tries again twice before it fails.
const LAYER_TRIES = 3;

async function loadLayer(url: string, tries: number): Promise<ImageData> {
  try {
    return await imageOf(url);
  } catch (error) {
    if (tries > 1) {
      return loadLayer(url, tries - 1);
    }
    throw error;
  }
}

function layerImage(folder: string, name: string) {
  const url = `${folder}/${encodeURIComponent(name)}.png`;
  return cached(images, url, () => loadLayer(url, LAYER_TRIES));
}

// Lays the layers over each other: the nearest pixel wins, as on the ship.
export async function buildStage(
  ship: ShipModule,
  parts: Parts,
  layers: [string, number][],
): Promise<Stage> {
  const { folder, format } = ship;
  const textured = format === "textured";
  const deep = format === "textured16";
  const { width, height } = parts;
  const shade = new Uint8Array(width * height);
  const depth = new Uint16Array(width * height);
  const group = new Int8Array(width * height).fill(HIDDEN);
  const textureU = new Uint16Array(width * height);
  const textureV = new Uint16Array(width * height);
  const rows = layers.filter(([name]) => parts.layers[name]);
  const pictures = await Promise.all(
    rows.map(([name]) => layerImage(folder, name)),
  );
  const textures =
    textured || deep
      ? await Promise.all(
          rows.map(([name]) => layerImage(folder, `${name}.uv`)),
        )
      : null;
  rows.forEach(([name, owner], index) => {
    const [left, top, across, down] = parts.layers[name];
    const { data } = pictures[index];
    const texture = textures?.[index].data;
    for (let y = 0; y < down; y += 1) {
      for (let x = 0; x < across; x += 1) {
        const from = (y * across + x) * 4;
        if (data[from + 3] === 0) {
          continue;
        }
        const to = (top + y) * width + left + x;
        const near = textured
          ? data[from + 1]
          : (data[from + 1] << 8) | data[from + 2];
        if (group[to] === HIDDEN || near >= depth[to]) {
          shade[to] = data[from];
          depth[to] = near;
          group[to] = owner;
          if (texture && deep) {
            textureU[to] =
              (texture[from] << DEEP_RED_SHIFT) |
              (texture[from + 1] >> DEEP_RED_SHIFT);
            textureV[to] =
              ((texture[from + 1] & DEEP_LOW_MASK) << 8) | texture[from + 2];
          } else if (texture) {
            textureU[to] = texture[from];
            textureV[to] = (texture[from + 1] << 8) | texture[from + 2];
          }
        }
      }
    }
  });
  return {
    shade,
    group,
    textureU,
    textureV,
    ...(deep ? DEEP : TEXTURED),
    width,
    height,
  };
}

const rgb = (hex: string) =>
  [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);

const textures = new Map<string, Promise<ImageData>>();

// The texture of a paint, baked from its layers as the game bakes it
// (`bakeTexture`, below).
export function paintTexture(folder: string, painted: Painted) {
  return bakeTexture(folder, painted.layers);
}

// Where the pixel at `at` reads `texture`, as an index into its data.
function texel(stage: Stage, texture: ImageData, at: number) {
  const column = Math.floor(
    ((stage.textureU[at] - 1) * texture.width) / stage.uSteps,
  );
  const line = Math.floor((stage.textureV[at] * texture.height) / stage.vSteps);
  return (line * texture.width + column) * 4;
}

// The light of the tone paint at `at`, 1 where the pixel reads no texture or the
// ship has no paint: black plates come out dark and light ones light, so a grey
// ship and a tile still tell the plate shades apart.
export function toneAt(stage: Stage, tone: ImageData | null, at: number) {
  if (!tone || !stage.textureU[at]) {
    return 1;
  }
  const from = texel(stage, tone, at);
  const [red, green, blue] = tone.data.subarray(from, from + 3);
  const light = (0.3 * red + 0.59 * green + 0.11 * blue) / 255;
  return TONE_FLOOR + (1 - TONE_FLOOR) * light;
}

// Draws the ship: painted with `texture` (a pixel that reads none in `bare`), else
// grey in the tone's light, the `lit` groups and the one under the pointer brighter.
export function drawShip(
  canvas: HTMLCanvasElement,
  stage: Stage,
  lit: Set<number>,
  hover: number,
  texture: ImageData | null,
  tone: ImageData | null,
  bare: number = LENS,
) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const { shade, group, textureU, width, height } = stage;
  const image = context.createImageData(width, height);
  for (let at = 0; at < shade.length; at += 1) {
    const owner = group[at];
    if (owner === HIDDEN) {
      continue;
    }
    const value = shade[at];
    // The open groups, or the one under the pointer, light up: the other picked
    // groups stay grey. Parts every ship carries belong to no group and never
    // light up.
    const bright = owner >= 0 && (lit.has(owner) || owner === hover);
    const to = at * 4;
    if (texture) {
      const light = ((bright ? LIT : 1) * GAME_LIGHT * value) / 255;
      const from = texel(stage, texture, at);
      for (let channel = 0; channel < 3; channel += 1) {
        const lightless = textureU[at] ? texture.data[from + channel] : bare;
        image.data[to + channel] = Math.min(255, lightless * light);
      }
    } else {
      const grey = value * toneAt(stage, tone, at);
      image.data[to] = grey * (bright ? 1 : 0.72);
      image.data[to + 1] = grey * (bright ? 0.62 : 0.76);
      image.data[to + 2] = grey * (bright ? 0.36 : 0.82);
    }
    image.data[to + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}

// The game's bake shader for a procedural texture, as crimson-orb reads it
// (`texture_frag_combine_diffuse_0.metallib`; `utils/tools/ship_art/living_ship_paint.py`,
// `bake`; docs/ships/living-ships.md, The bake's shader). `GammaCorrectInput`: a
// channel up to 1 to the power 2.2, above 1 to 2.4.
const GAMMA_IN = 2.2;
const GAMMA_IN_ABOVE_ONE = 2.4;
// `Recolour` moves a texel's value toward the colour's by this share at a value of
// one half, falling off as `10 ** (-10 * (v - 0.5) ** 2)`.
const VALUE_SHARE = 0.47663;
const VALUE_FALLOFF = 10;
// A layer's alpha is `saturate(a - 0.004) * 1.004016`.
const ALPHA_FLOOR = 0.004;
const ALPHA_SCALE = 1.004016;
// The epsilon of the shader's RGB to HSV.
const HSV_EPSILON = 1e-10;

const gammaIn = (value: number) =>
  value > 1 ? value ** GAMMA_IN_ABOVE_ONE : Math.max(value, 0) ** GAMMA_IN;
const gammaOut = (value: number) =>
  value < 1
    ? Math.max(value, 0) ** (1 / GAMMA_IN)
    : value ** (1 / GAMMA_IN_ABOVE_ONE);

// The shader's RGB to HSV, in its branchless form.
function hsv(r: number, g: number, b: number): [number, number, number] {
  const [px, py, pz, pw] = g < b ? [b, g, -1, 2 / 3] : [g, b, 0, -1 / 3];
  const [qx, qy, qz, qw] = r < px ? [px, py, pw, r] : [r, py, pz, px];
  const d = qx - Math.min(qw, qy);
  return [
    Math.abs(qz + (qw - qy) / (6 * d + HSV_EPSILON)),
    d / (qx + HSV_EPSILON),
    qx,
  ];
}

const wrap = (value: number) => value - Math.floor(value);

// `Recolour` with Multiply off: the texel's hue turned by the colour's hue less the
// layer's average hue, the lower saturation, and the texel's value moved part way
// toward the colour's from the average's; written into `out` in linear light.
function recolour(
  texel: number[],
  average: [number, number, number],
  colour: [number, number, number],
  out: number[],
) {
  const [hueT, satT, valueT] = hsv(texel[0], texel[1], texel[2]);
  const hue = wrap(hueT - average[0] + colour[0]);
  const sat = Math.min(satT, colour[1]);
  const share =
    VALUE_SHARE * VALUE_FALLOFF ** (-VALUE_FALLOFF * (valueT - 0.5) ** 2);
  const value = share * (colour[2] - average[2]) + valueT;
  [1, 2 / 3, 1 / 3].forEach((offset, channel) => {
    const wheel = Math.min(
      1,
      Math.max(0, Math.abs(wrap(hue + offset) * 6 - 3) - 1),
    );
    out[channel] = gammaIn(
      Math.min(1, Math.max(0, value * (1 + (wheel - 1) * sat))),
    );
  });
}

// A texture baked from `layers`, bottom first: the base layer replaces, each other
// mixes over it by its alpha, in linear light.
function bakeTexture(folder: string, layers: BakeLayer[]) {
  const key = `${folder}:${JSON.stringify(layers)}`;
  return cached(textures, key, () =>
    Promise.all(
      layers.flatMap(({ map }) => [
        imageOf(`${folder}/layer-${map}.png`),
        imageOf(`${folder}/layer-${map}.alpha.png`),
      ]),
    ).then((images) => {
      const { width, height } = images[0];
      const count = width * height;
      const out = new ImageData(width, height);
      const lit = new Float32Array(count * 3);
      const texel = [0, 0, 0];
      const made = [0, 0, 0];
      layers.forEach((layer, index) => {
        const colour = images[index * 2].data;
        const alpha = images[index * 2 + 1].data;
        const average = hsv(
          layer.average[0],
          layer.average[1],
          layer.average[2],
        );
        const target = layer.colour ? rgb(layer.colour) : null;
        const goal = target ? hsv(target[0], target[1], target[2]) : null;
        for (let at = 0; at < count; at += 1) {
          for (let channel = 0; channel < 3; channel += 1) {
            texel[channel] = colour[at * 4 + channel] / 255;
            made[channel] = gammaIn(texel[channel]);
          }
          if (goal) {
            recolour(texel, average, goal, made);
          }
          const weight =
            index === 0
              ? 1
              : Math.min(1, Math.max(0, alpha[at * 4] / 255 - ALPHA_FLOOR)) *
                ALPHA_SCALE;
          for (let channel = 0; channel < 3; channel += 1) {
            const to = at * 3 + channel;
            lit[to] += (made[channel] - lit[to]) * weight;
          }
        }
      });
      for (let at = 0; at < count; at += 1) {
        for (let channel = 0; channel < 3; channel += 1) {
          out.data[at * 4 + channel] = Math.min(
            255,
            gammaOut(lit[at * 3 + channel]) * 255,
          );
        }
        out.data[at * 4 + 3] = 255;
      }
      return out;
    }),
  );
}
