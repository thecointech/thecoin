import { getEnvVars } from '@thecointech/setenv';
import { Erc20Provider } from '.';
import { describe, IsManualRun } from '@thecointech/jestutils'

describe('manual test', () => {
  it("reads ERC20 txs", async () => {
    const vars = getEnvVars("prod");
    process.env = vars;
    const provider = new Erc20Provider();

    const txs = await provider.getERC20History({
      contractAddress: "0x14370e05b8c04315C7b64e37c0716dbf69A44ECD",
    })
    expect(txs.length).toBeGreaterThan(0);
  })
}, IsManualRun)
