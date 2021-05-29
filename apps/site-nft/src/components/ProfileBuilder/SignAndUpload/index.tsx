import { ImageEditorComponent } from '@toast-ui/react-image-editor';
import {hash} from './prcp';
import {IExif, IExifElement, TagNumbers, dump, insert} from "exif-library";
import { Signer } from 'ethers';
import { signMessage } from '@thecointech/nft-contract';

//
// Sign & Upload to the server
export async function signAndUpload(editor: ImageEditorComponent | null, signer?: Signer) {
  const instance = editor?.getInstance();
  if (!instance || !signer) return;
  // first, get the image:
  const canvas: HTMLCanvasElement = (instance as any)._graphics.getCanvasElement();

  // Get image hash
  const hash = await getHash(canvas);
  // Owner signs the image
  const signature = await signMessage(hash, signer);

  // Now, convert to JPG.
  // TODO: can we make this PNG?  For now,
  // FB profile pics are in JPG so may be safer bet.
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
  // Add signature info to PNG
  const tweakedUri = updateExif(dataUrl, hash, signature);
  const blob = base64ToBlob(tweakedUri);

  return blob;
}

//
// Add EXIF data
export function updateExif(dataUrl: string, hash: string, signature: string) {
  const zeroth: IExifElement = {};
  zeroth[TagNumbers.ImageIFD.ImageDescription] = hash;
  zeroth[TagNumbers.ImageIFD.Copyright] = signature;
  const exifObj: IExif = {"0th":zeroth};
  const exifStr = dump(exifObj);

  var inserted = insert(exifStr, dataUrl);
  return inserted;
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

// function downloadBlob(blob: Blob, name = 'file.jpg') {
//   // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
//   const blobUrl = URL.createObjectURL(blob);

//   // Create a link element
//   const link = document.createElement("a");

//   // Set link's href to point to the Blob URL
//   link.href = blobUrl;
//   link.download = name;

//   // Append link to the body
//   document.body.appendChild(link);

//   // Dispatch click event on the link
//   // This is necessary as link.click() does not work on the latest firefox
//   link.dispatchEvent(
//     new MouseEvent('click', {
//       bubbles: true,
//       cancelable: true,
//       view: window
//     })
//   );

//   // Remove link from body
//   document.body.removeChild(link);
// }
