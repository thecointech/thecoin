import { AccountName, getSigner } from "@thecointech/signers";

  const initAddress = async (name: AccountName) => {
    const signer = await getSigner(name);
    process.env[`WALLET_${name}_ADDRESS`] = await signer.getAddress();
  }

export async function initAllAddresses() {

  await initAddress("BrokerCAD");
  await initAddress("BrokerTransferAssistant");
  await initAddress("TheCoin");
  await initAddress("Minter");
}

it("always succeeds", () => {});
