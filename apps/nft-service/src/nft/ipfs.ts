
import pinataSDK from '@pinata/sdk';
import { log } from '@thecointech/logging';

const pinata = pinataSDK(process.env.PINATA_API_KEY!, process.env.PINATA_API_SECRET!);

//
// Upload buffer to IPFS, return upload hash
export async function upload(file: Buffer) {
  log.trace(`Uploading ${file.byteLength} bytes for `)
  const r = await pinata.pinFileToIPFS(file, {
    pinataOptions: {
      cidVersion: 0
    }
  });
  log.trace({tokenUri: r.IpfsHash}, `Completed ${r.PinSize} bytes for {tokenUri}`);
  return r.IpfsHash
}

export function createMetaFile(avatarHash: string) {

}
