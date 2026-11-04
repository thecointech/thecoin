import { AbstractSigner, BaseWallet, Signature, Wallet } from "ethers";
import type { Provider, TransactionRequest, TypedDataDomain, TypedDataField } from "ethers";
import { getEncryptionKey } from "./encryptionKey";
import { encryptPreferences, decryptPreferences } from "./preferences";

// Emulates a remote signer: no access to the key, and
// encodes v as 0/1 rather than 27/28 (as some hardware wallets do)
class RemoteSigner extends AbstractSigner {
  calls = 0;
  constructor(private wallet: BaseWallet, private reject = false) { super(); }
  getAddress() { return Promise.resolve(this.wallet.address); }
  connect(_p: Provider | null): RemoteSigner { return this; }
  async signMessage(message: string | Uint8Array) {
    this.calls++;
    if (this.reject) throw new Error("User rejected");
    const sig = Signature.from(await this.wallet.signMessage(message));
    return sig.r + sig.s.slice(2) + (sig.yParity ? "01" : "00");
  }
  signTransaction(_tx: TransactionRequest): Promise<string> { throw new Error("Not supported"); }
  signTypedData(_d: TypedDataDomain, _t: Record<string, TypedDataField[]>, _v: Record<string, any>): Promise<string> { throw new Error("Not supported"); }
}

it("derives the same key from local and remote signers", async () => {
  const wallet = Wallet.createRandom();
  const local = await getEncryptionKey(new Wallet(wallet.privateKey));
  const remote = await getEncryptionKey(new RemoteSigner(new Wallet(wallet.privateKey)));
  expect(remote.privateKey).toEqual(local.privateKey);
  // The encryption key is not the signing key
  expect(local.privateKey).not.toEqual(wallet.privateKey);
});

it("only prompts the signer once", async () => {
  const signer = new RemoteSigner(Wallet.createRandom());
  await getEncryptionKey(signer);
  await getEncryptionKey(signer);
  expect(signer.calls).toBe(1);
});

it("does not cache a rejected prompt", async () => {
  const wallet = Wallet.createRandom();
  await expect(getEncryptionKey(new RemoteSigner(wallet, true))).rejects.toThrow();
  await expect(getEncryptionKey(new RemoteSigner(wallet))).resolves.toBeDefined();
});

it("round-trips preferences with a derived key", async () => {
  const key = await getEncryptionKey(Wallet.createRandom());
  const prefs = { accountName: "Savings", displayCurrency: 124 };
  const blob = await encryptPreferences(prefs, key.compressedPublicKey);
  expect(await decryptPreferences(blob, key.privateKey)).toEqual(prefs);
});
