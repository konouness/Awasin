const READ_ERROR = 'Foto tidak bisa dibaca, coba ambil ulang';

function toBlob(canvas: HTMLCanvasElement, q: number): Promise<Blob> {
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error(READ_ERROR))), 'image/jpeg', q));
}

export async function compressImage(file: File, maxBytes = 200_000, maxSide = 1280): Promise<Blob> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(READ_ERROR);
  }
  let side = maxSide;
  for (let round = 0; round < 6; round++) {
    const scale = Math.min(1, side / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    for (let q = 0.8; q >= 0.4 - 1e-9; q -= 0.1) {
      const blob = await toBlob(canvas, q);
      if (blob.size <= maxBytes) return blob;
    }
    side = Math.round(side * 0.75);
  }
  throw new Error('Foto terlalu besar, coba ambil ulang dari jarak lebih dekat');
}
