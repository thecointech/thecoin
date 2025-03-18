import { jest } from '@jest/globals';
import { loadFromDisk } from './fromDisk';
import { describe, ifSecret } from '@thecointech/jestutils';
import { getEnvVars } from '@thecointech/setenv';

jest.setTimeout(5 * 60 * 1000);

describe("Encrypted json wallet", () => {
  it("Loads & decrypt wallet", async () => {
    process.env.CONFIG_NAME="prodtest";
    const signer = await loadFromDisk("Minter");
    const address = await signer.getAddress();
    const env = getEnvVars("prodtest");
    expect(address).toEqual(env.WALLET_Minter_ADDRESS);

    const signed = await signer.signMessage("test");
    expect(signed).toBeTruthy();;
  })
}, !!(await ifSecret("SignerMinterPwd")))
