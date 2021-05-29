import { createCanvas, loadImage } from 'canvas'
import { join } from 'path';
import { getHash, updateExif } from '../index';


it('Can hash the image', async() => {
  const canvas = await loadCanvas();
  const hash = await getHash(canvas);
  expect(hash).toBe('030753f7f5770303');
})

it ('reads & write EXIF', async() => {
  const canvas = await loadCanvas();
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
  const updated = updateExif(dataUrl, "12345");
  expect(updated).toBeTruthy();
});

async function loadCanvas() {
  const img = await loadImage(join(__dirname, 'test.jpg'));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas as unknown as HTMLCanvasElement;
}
