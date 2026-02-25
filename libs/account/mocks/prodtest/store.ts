import { buildNewAccount } from '@/state';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import * as Browser from '@/store';
import { getProvider } from '@thecointech/ethers-provider';
import { ContractCore } from '@thecointech/contract-core';
import { Wallet } from 'ethers';
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
    const privateKey = process.env.PRODTEST_TESTDEMOACCOUNT_WALLET;

    if (privateKey) {
      try {
        const provider = await getProvider();
        const wallet = new Wallet(privateKey, provider);
        const address = NormalizeAddress(await wallet.getAddress());

        // Create a read-only demo account
        const demoAccount = buildNewAccount(testDemoAccountName, address, wallet);
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
