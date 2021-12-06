import { getEnvVars } from '../../../tools/setenv';
import { loadHardware } from './fromHardware';
import { describe, IsManualRun} from '@thecointech/jestutils';

jest.setTimeout(5 * 60 * 1000);

describe("Hardware connection", () => {
  it("Connects to HD device", async () => {
    const prod = getEnvVars("prod");
    process.env.WALLET_Owner_ADDRESS = prod.WALLET_Owner_ADDRESS;
    const signer = await loadHardware("Owner");
    const address = await signer.getAddress();
    expect(address).toMatch(prod.WALLET_Owner_ADDRESS);

    const signed = await signer.signMessage("test");
    expect(signed).toBeTruthy();;
  })
}, IsManualRun)
