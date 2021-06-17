
import { log } from '@thecointech/logging';
import { sign as doSign } from "@thecointech/utilities/SignedMessages";
import { Signer } from 'ethers';
import { dump, IExif, IExifElement, insert, load, TagNumbers } from 'exif-library';
import { hash } from './prcp';

//
// Prepare the the canvas for upload to NFT
//

// Create signed blob
export async function sign(canvas: HTMLCanvasElement, signer: Signer) {
  log.trace('Signing canvas');
  // Get image hash
  const hash = await getHash(canvas);
  // Owner signs the image
  const signature = await doSign(hash, signer);

  // Now, convert to JPG.
  // TODO: can we make this PNG?  For now,
  // FB profile pics are in JPG so may be safer bet.
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
  // Add signature info to PNG
  const tweakedUri = updateExif(dataUrl, 'TheCoin', hash, signature);
  const blob = base64ToBlob(tweakedUri);

  return blob;
}

//
// Add EXIF data
export function updateExif(dataUrl: string, author: string, hash: string, signature: string) {
  const zeroth: IExifElement = {};
  zeroth[TagNumbers.ImageIFD.Artist] = author;
  zeroth[TagNumbers.ImageIFD.ImageDescription] = hash;
  zeroth[TagNumbers.ImageIFD.Copyright] = signature;
  const exifObj: IExif = {"0th":zeroth};
  const exifStr = dump(exifObj);

  var inserted = insert(exifStr, dataUrl);
  return inserted;
}

//
// Read the EXIF data we would have saved to the image
export function readExif(dataUrl: string) {
  const exifObj = load(dataUrl);
  const author = exifObj?.['0th']?.[TagNumbers.ImageIFD.Artist] as MaybeString;
  const hash = exifObj?.['0th']?.[TagNumbers.ImageIFD.ImageDescription] as MaybeString;
  const signature = exifObj?.['0th']?.[TagNumbers.ImageIFD.Copyright] as MaybeString;
  if (!author || !hash || !signature) return null;
  return {
    author,
    signature,
    hash,
  }
}

//
// String to raw binary data
function base64ToBlob(data: string) {
  let mimeString = '';

  let raw = data.replace(/data:(image\/.+);base64,/, (_, imageType) => {
    mimeString = imageType;
    return '';
  });

  raw = atob(raw);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: mimeString });
}

export function getHash(canvas: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) => {
    try {
      const context = canvas.getContext('2d')
      const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
      if (!imageData) {
        reject('No ImageData present');
      }
      else {
        const r = hash(imageData, 8);
        resolve(r);
      }
    }
    catch (err) { reject(err); }
  })
}
