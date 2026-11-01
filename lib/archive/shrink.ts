// Brings a picture to one width in the browser, so that every screenshot on
// the site is alike and fits the 1 MB of the bucket: a game screenshot is
// several megabytes, and a player should not have to deal with that.

const MAX_BYTES = 1024 * 1024;
const WIDTH = 1600;
const QUALITIES = [0.85, 0.7, 0.55];

function encode(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function shrinkPicture(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of QUALITIES) {
    const blob = await encode(canvas, "image/webp", quality);
    // A browser without a WebP encoder answers with PNG.
    const picture =
      blob?.type === "image/webp"
        ? blob
        : await encode(canvas, "image/jpeg", quality);
    if (picture && picture.size <= MAX_BYTES) {
      return picture;
    }
  }
  throw new Error("The picture cannot be made small enough.");
}
