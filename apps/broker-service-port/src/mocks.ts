import { ReconciledRecord } from './types';
import { BigNumber } from 'ethers';

export const mockedContract = (tx: ReconciledRecord) => ({
  coinPurchase: () => Promise.resolve({ hash: tx.data.hash }),
  balanceOf: () => Promise.resolve(BigNumber.from(tx.data.transfer.value + 50000)),
  certifiedTransfer: () => Promise.resolve({ hash: tx.data.hash, confirmations: 2 }),
  provider: {
    waitForTransaction: () => Promise.resolve({ status: "success" })
  }
}) as any

export const mockedBank = (tx: ReconciledRecord) => ({
  depositETransfer: () => Promise.resolve({
    result: "success",
    code: 0,
    confirmation: tx.data.confirmation ?? "LOST"
  }),
  sendETransfer: () => {
    const confirmation = tx.data.fiatDisbursed
      ? tx.database?.confirmation ?? 1
      : -1
    return Promise.resolve(confirmation)
  }
}) as any;
