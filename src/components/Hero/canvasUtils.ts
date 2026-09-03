export interface CoverRect {
  scale: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export function computeCoverRect(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
): CoverRect {
  if (!containerW || !containerH || !imageW || !imageH) {
    return { scale: 1, dx: 0, dy: 0, dw: containerW, dh: containerH };
  }

  const containerAspect = containerW / containerH;
  const imageAspect = imageW / imageH;

  const scaleCover = Math.max(containerW / imageW, containerH / imageH);
  const scaleContain = Math.min(containerW / imageW, containerH / imageH);

  const isNarrowViewport = containerAspect < imageAspect * 0.55;
  const scale = isNarrowViewport ? scaleContain : scaleCover;

  const dw = imageW * scale;
  const dh = imageH * scale;
  const dx = (containerW - dw) / 2;
  const dy = (containerH - dh) / 2;

  return { scale, dx, dy, dw, dh };
}

export interface MaskData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function extractMaskData(img: HTMLImageElement): MaskData {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { data: new Uint8ClampedArray(0), width: 0, height: 0 };
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data, width: canvas.width, height: canvas.height };
}

export function sampleMaskAlpha(mask: MaskData, x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= mask.width || iy >= mask.height) return 0;
  const idx = (iy * mask.width + ix) * 4;
  return mask.data[idx];
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  rect: CoverRect,
  offsetX = 0,
  offsetY = 0,
): void {
  ctx.drawImage(img, rect.dx + offsetX, rect.dy + offsetY, rect.dw, rect.dh);
}
