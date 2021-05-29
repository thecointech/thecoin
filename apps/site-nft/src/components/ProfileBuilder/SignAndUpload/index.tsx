import { ImageEditorComponent } from '@toast-ui/react-image-editor';
import {hash} from './prcp';
import {IExif, IExifElement, TagValues, dump, insert} from "exif-library";


export async function signAndUpload(editor: ImageEditorComponent | null) {
  const instance = editor?.getInstance();
  if (!instance) return;
  // first, get the image:
  const canvas: HTMLCanvasElement = (instance as any)._graphics.getCanvasElement();

  // Get image hash
  const hash = await getHash(canvas)
  // Now, convert to JPG.
  // TODO: can we make this PNG?  For now,
  // FB profile pics are in JPG so may be safer bet.
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
  // Add signature info to PNG
  const tweakedUri = updateExif(dataUrl, hash);

  // const size = instance.getCanvasSize();
  // console.log(size);
  //const imageData = await getImageData(dataUrl);
  //const dataUrl = instance.toDataURL();
  const blob = base64ToBlob(tweakedUri);

  // Now, lets generate the perceptual hash of the image.
  //const hash = getHash(dataUrl);
  //const other = await getOtherHash(imageData!);

  // const dataUrl = instance.toDataURL();
  // const blob = base64ToBlob(dataUrl);
  downloadBlob(blob)
  //return hash == other;
}

// async function getImageData(base64Url: string): Promise<ImageData> {
//   return new Promise((resolve, reject) => {
//     const url = URL.createObjectURL(dataUrl)
//     const img = new Image();
//     img.onload = function () {
//       URL.revokeObjectURL(url);
//       const canvas = new OffscreenCanvas(img.width, img.height);
//       const context = canvas.getContext('2d');
//       context?.drawImage(img, 0, 0);
//       const myData = context?.getImageData(0, 0, img.width, img.height);
//       if (myData) resolve(myData);
//       else reject('Couldnt get data');
//     };
//     img.src = url;
//   })
// }

export function updateExif(dataUrl: string, hash: string) {
  const zeroth: IExifElement = {};
  const exif: IExifElement = {};
  const gps: IExifElement = {};
  zeroth[TagValues.ImageIFD.Make] = "Make";
  zeroth[TagValues.ImageIFD.XResolution] = [777, 1];
  zeroth[TagValues.ImageIFD.YResolution] = [777, 1];
  zeroth[TagValues.ImageIFD.Software] = hash;
  exif[TagValues.ExifIFD.DateTimeOriginal] = "2010:10:10 10:10:10";
  exif[TagValues.ExifIFD.LensMake] = "LensMake";
  exif[TagValues.ExifIFD.Sharpness] = 777;
  exif[TagValues.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]];
  gps[TagValues.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
  gps[TagValues.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";
  const exifObj: IExif = {"0th":zeroth, "Exif":exif, "GPS":gps};
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

//
// Get the hash of the image
// function getHash(dataUrl: string) {
//   return new Promise<string>((resolve, reject) => {
//     blockhash(dataUrl, 8, 2, (error, result) => {
//       if (error) reject(error);
//       else resolve(result);
//     })
//   })
// }
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

function downloadBlob(blob: Blob, name = 'file.jpg') {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  );

  // Remove link from body
  document.body.removeChild(link);
}
