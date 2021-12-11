import { getEnvVars } from '../../../tools/setenv';
import { loadFromDisk } from './fromDisk';
import { describe, IsManualRun} from '@thecointech/jestutils';

jest.setTimeout(5 * 60 * 1000);

describe("Encrypted json wallet", () => {
  it("Loads & decrypt wallet", async () => {
    const prod = getEnvVars("prod");
    process.env = prod;
    const signer = await loadFromDisk("Minter");
    const address = await signer.getAddress();
    expect(address).toEqual(process.env.WALLET_Minter_ADDRESS);

    const signed = await signer.signMessage("test");
    expect(signed).toBeTruthy();;
  })
}, IsManualRun)
