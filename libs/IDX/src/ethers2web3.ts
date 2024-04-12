import type { Signer } from '@ethersproject/abstract-signer';
import { arrayify } from '@ethersproject/bytes';

type Web3Send = {
  method: string,
  params: Array<any>
}
export class Ethers3Web3Converter {

  signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer
  }

  async send({method, params}: Web3Send, callback: (error: Error | null, result: any) => void) {
    switch(method) {
      case 'eth_chainId':
        const asHex = parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!).toString(16);
        callback(null, {result: asHex});
        break;
      case 'personal_sign':
        // Note, our input has already been hex-encoded,
        // but our signMessage function expects the raw string
        // prevent that change by pre-converting to array
        const hexString = params[0];
        const asArray = arrayify(hexString);
        const signature = await this.signer.signMessage(asArray);
        callback(null, {result: signature});
    }
  }
}
