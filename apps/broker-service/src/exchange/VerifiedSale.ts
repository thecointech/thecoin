import { CertifiedTransfer } from '../types';
import { CertifiedActionVerify } from './CertifiedActionVerify';
import { CertifiedActionProcess } from './CertifiedActionProcess';

async function  DoCertifiedSale(sale: CertifiedTransfer) {

  CertifiedActionVerify(sale);

  // Process the action
  return await CertifiedActionProcess(sale, "Sell");
}

export { DoCertifiedSale }
