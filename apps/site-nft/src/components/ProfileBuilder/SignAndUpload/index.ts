// import { ImageEditorComponent } from '@toast-ui/react-image-editor';
import { Signer } from 'ethers';
import { sign } from './sign';
import { updateNft, uploadAvatar, uploadMetadata } from './updateNft';

//
// Sign & Upload to the server
export async function signAndUpload(editor: ImageEditorComponent | null, tokenId: number, signer?: Signer) {
  const instance = editor?.getInstance();
  if (!instance || !signer) return;
  // first, get the image:
  const canvas: HTMLCanvasElement = (instance as any)._graphics.getCanvasElement();
  // Get data to upload
  const blob = await sign(canvas, signer);
  // Download it
  downloadBlob(blob);

  // Upload to IPFS
  const avatarHash = await uploadAvatar(blob, signer);
  // Upload metadata
  const metadataUri = await uploadMetadata(tokenId, `ipfs://${avatarHash}`, signer);
  // Now update the NFT to reflect thes changes
  const r = await updateNft(tokenId, metadataUri, signer);
  alert('Update success: ' + r);
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
