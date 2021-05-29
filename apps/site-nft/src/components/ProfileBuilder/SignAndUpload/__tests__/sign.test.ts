import { createCanvas, loadImage } from 'canvas'
import { join } from 'path';
import { getHash, updateExif } from '../sign';

it('Can hash the image', async() => {
  const canvas = await loadCanvas();
  const hash = await getHash(canvas);
  expect(hash).toBe('030377b7f7530703');
})

it ('reads & write EXIF', async() => {
  const canvas = await loadCanvas();
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
  const updated = updateExif(dataUrl, 'TheCoin', '12345', '56789');
  expect(updated).toBeTruthy();
});

async function loadCanvas() {
  const img = await loadImage(join(__dirname, 'test.jpg'));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas as unknown as HTMLCanvasElement;
}
