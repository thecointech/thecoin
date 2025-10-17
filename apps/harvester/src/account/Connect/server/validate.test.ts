import { ConnectionValues } from "@thecointech/types";
import { Wallet } from "ethers";
import { validate } from "./validate";

it ('should validate', () => {
    const wallet = Wallet.createRandom();
    const v: ConnectionValues = {
        address: wallet.address,
        locale: wallet.mnemonic!.wordlist!.locale,
        path: wallet.path!,
        phrase: wallet.mnemonic!.phrase,
        siteOrigin: process.env.URL_SITE_APP || 'required',
        state: "state",
        timestamp: Date.now().toString(),
        name: "name",
        walletFile: JSON.stringify(wallet),
    }
    expect(() => validate(v, "state")).not.toThrow();
});
