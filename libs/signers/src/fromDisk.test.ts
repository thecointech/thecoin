import { jest } from '@jest/globals';
import { getEnvVars } from '@thecointech/setenv';
import { loadFromDisk } from './fromDisk';
import { describe } from '@thecointech/jestutils';

jest.setTimeout(5 * 60 * 1000);
const prodVars = getEnvVars('prodtest');

describe("Encrypted json wallet", () => {
  it("Loads & decrypt wallet", async () => {
    process.env = prodVars;
    const signer = await loadFromDisk("Minter");
    const address = await signer.getAddress();
    expect(address).toEqual(process.env.WALLET_Minter_ADDRESS);

    const signed = await signer.signMessage("test");
    expect(signed).toBeTruthy();;
  })
}, !!prodVars.WALLET_Minter_PATH)
