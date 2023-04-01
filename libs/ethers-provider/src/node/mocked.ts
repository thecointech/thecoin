import { readFileSync } from 'fs';
import { Erc20Provider as BaseProvider } from '../web/mocked';
export { getProvider } from '../web/mocked';

// Add a local provider for jest
export class Erc20Provider extends BaseProvider {
  async getSourceCode(name: string) {
    const baseUrl = new URL('../../../..', import.meta.url);
    switch (name) {
      case "ShockAbsorber": {
        return readFileSync(new URL("contract-plugin-shockabsorber/contracts/ShockAbsorber.sol", baseUrl), 'utf-8')
      }
      case "UberConverter": {
        return readFileSync(new URL("contract-plugin-converter/contracts/UberConverter.sol", baseUrl), 'utf-8')
      }
      case "RoundNumber": {
        return readFileSync(new URL("contract-plugin-roundnumber/contracts/RoundNumber.sol", baseUrl), 'utf-8')
      }
    }
    throw new Error(`Unknown contract: ${name}`);
  }
}
