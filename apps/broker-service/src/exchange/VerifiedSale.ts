import { CertifiedActionVerify } from './CertifiedActionVerify';
import { CertifiedActionProcess } from './CertifiedActionProcess';
import { CertifiedTransfer } from '@the-coin/types';

async function  DoCertifiedSale(sale: CertifiedTransfer) {

  CertifiedActionVerify(sale);

  // Process the action
  return await CertifiedActionProcess(sale, "Sell");
}

export { DoCertifiedSale }
