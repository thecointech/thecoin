import { GetContract } from "@thecointech/contract";
import { Wallet } from "ethers";
import { BuildVerifiedXfer, GetTransferSigner } from "./VerifiedTransfer";

test("Verified signature matches", async () => {
  const contract = await GetContract();
  expect(contract.address).toBeDefined();

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
  // verify that this signature matches what the contract expects
  var signer = await contract.recoverSigner(
    wallet.address,
    wallet.address,
    value,
    fee,
    timestamp,
    signature
  );
  expect(signer == wallet.address);

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
