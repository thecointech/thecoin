import type { Signer } from '@ethersproject/abstract-signer';
import type { Provider } from '@ethersproject/abstract-provider';

type BuildSigner = () => Promise<Signer>;
export type SignerBuilders = Record<string, BuildSigner>;

async function getSigners(builders: SignerBuilders, provider: Provider) {
  const signers : Record<string, Signer> = {};
  for (const key in builders) {
    const signer = await builders[key]();
    signers[key.toLowerCase()] = signer.connect(provider);
  }
  return signers;
}


export class EthersSubprovider {
  private getSigners: Promise<Record<string, Signer>>;
  private addresses: string[];

  constructor(builders: SignerBuilders, provider: Provider) {
    this.addresses = Object.keys(builders).map(s => s.toLowerCase());
    this.getSigners = getSigners(builders, provider);
  }

  private async doWith(from: string, cb: any, doer: (s: Signer) => Promise<any>) {
    const signers = await this.getSigners;
    if (!signers[from]) cb("Account not found");
    else {
      const r = await doer(signers[from]);
      cb(null, r);
    }
  }

  public getAccounts = (cb: any) => {
    cb(null, this.addresses);
  }
  public signTransaction = async (txParams: any, cb: any) => {
    const from = txParams.from.toLowerCase();
    this.doWith(from, cb, async (signer) => {
      const chainId = await signer.getChainId()
      const r = await signer.signTransaction({
        data: txParams.data,
        nonce: txParams.nonce,
        gasLimit: txParams.gas,
        gasPrice: txParams.gasPrice,
        chainId,
      });
      return r;
    })
  }
  public signMessage = async ({ data, from }: any, cb: any) => {
    this.doWith(from, cb, (signer) => signer.signMessage(data));
  }
  public signPersonalMessage = (tx: any, cb: any) => {
    this.signMessage(tx, cb);
  }
  // signTypedMessage({ data, from }: any, cb: any){
  //   this.doWith(from, cb, (signer) => signer._signTypedData(data))
  // }
  // decryptMessage(){}
  // encryptionPublicKey(){}
}
