import { Wallet, HDNodeWallet } from "ethers";
import { encryptObject, decryptObject } from "./crypto";

const alice = Wallet.createRandom();
const broker = Wallet.createRandom();
const eve = Wallet.createRandom();

const recipientOf = (w: HDNodeWallet) => ({
  address: w.address,
  pubKey: w.signingKey.compressedPublicKey,
});

it("round-trips for each recipient independently", async () => {
  const data = { name: "Alice", n: 42 };
  const blob = await encryptObject(data, [recipientOf(alice), recipientOf(broker)]);

  expect(await decryptObject(blob, alice.privateKey)).toEqual(data);
  expect(await decryptObject(blob, broker.privateKey)).toEqual(data);
});

it("cannot be decrypted by a non-recipient", async () => {
  const blob = await encryptObject({ secret: true }, [recipientOf(alice)]);
  await expect(decryptObject(blob, eve.privateKey)).rejects.toThrow();
});

it("detects tampering (AES-GCM auth)", async () => {
  const blob = await encryptObject({ a: 1 }, [recipientOf(alice)]);
  const raw = Buffer.from(blob.cipher, "base64");
  raw[0] ^= 0xff;
  blob.cipher = raw.toString("base64");
  await expect(decryptObject(blob, alice.privateKey)).rejects.toThrow();
});
