import { buildNewAccount } from '@/state';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import * as Browser from '@/store';
import { getProvider } from '@thecointech/ethers-provider';
import { ContractCore } from '@thecointech/contract-core';
// Re-export everything from Browser store except getAllAccounts
export const {
  getAllAccounts: _,
  ...rest
} = Browser;
export * from '@/store';

const testDemoAccountName = "TestDemoAccount (Demo)";

// Override only getAllAccounts to inject TestDemoAccount
export const getAllAccounts = async () => {
  // First, load any user accounts from browser localStorage
  const accounts = await Browser.getAllAccounts();

  if (!accounts[testDemoAccountName]) {
    // Inject the TestDemoAccount if available from compile-time env variable
    const walletJson = process.env.PRODTEST_TESTDEMOACCOUNT_WALLET;

    if (walletJson) {
      try {
        const signer = JSON.parse(walletJson);
        // Mock being a remote signer
        signer.getAddress = () => signer.address;
        signer.provider = await getProvider();

        const address = NormalizeAddress(signer.address);

        // Create a read-only demo account with encrypted signer
        const demoAccount = buildNewAccount(testDemoAccountName, address, signer);
        demoAccount.contract = await ContractCore.get(signer.provider);

        accounts[address] = demoAccount;
        console.log('Injected TestDemoAccount (read-only) at:', address);
      } catch (error) {
        console.error('Failed to inject TestDemoAccount:', error);
      }
    }
  }

  return accounts;
};
