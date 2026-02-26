import { buildNewAccount } from '@/state';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import * as Browser from '@/store';
import { getProvider } from '@thecointech/ethers-provider';
import { ContractCore } from '@thecointech/contract-core';

// Re-export everything from Browser store except getAllAccounts
export * from '@/store';

const testDemoAccountName = "TestDemoAccount (ReadOnly)";

// Override only getAllAccounts to inject TestDemoAccount
export const getAllAccounts = async () => {
  // First, load any user accounts from browser localStorage
  const accounts = await Browser.getAllAccounts();

  const alreadyInjected = Object.values(accounts).some(a => a.name === testDemoAccountName);
  if (!alreadyInjected) {
    // Inject the TestDemoAccount if available from compile-time env variable
    const walletJson = process.env.PRODTEST_TESTDEMOACCOUNT_WALLET;

    if (walletJson) {
      try {
        const provider = await getProvider();
        const wallet = JSON.parse(walletJson);
        // Mock being a remote signer
        wallet.provider = provider;
        wallet.getAddress = () => wallet.address;
        const address = NormalizeAddress(wallet.address);

        // Create a read-only demo account
        const demoAccount = buildNewAccount(testDemoAccountName, wallet.address, wallet);
        demoAccount.contract = await ContractCore.get(provider);
        demoAccount.readonly = true;

        accounts[address] = demoAccount;
        console.log('Injected TestDemoAccount (read-only) at:', address);
      } catch (error) {
        console.error('Failed to inject TestDemoAccount:', error);
      }
    }
  }

  return accounts;
};
