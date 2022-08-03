import { Wallet } from "@ethersproject/wallet";
import { BuildVerifiedXfer, GetTransferSigner } from "./VerifiedTransfer";

test("Verified signature matches", async () => {

  const wallet = Wallet.createRandom();
  const value = 100000;
  const fee = 2000;
  const verifiedXfer = await BuildVerifiedXfer(
    wallet,
    wallet.address,
    value,
    fee
  );

  const { timestamp, signature } = verifiedXfer;
  const signer2 = GetTransferSigner({
    from: wallet.address,
    to: wallet.address,
    value,
    fee,
    timestamp,
    signature
  });
  expect(signer2 == wallet.address);
}, 50000);
