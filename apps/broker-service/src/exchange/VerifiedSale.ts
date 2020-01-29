import { CertifiedTransfer } from '@the-coin/types';
import { CertifiedActionVerify } from './CertifiedActionVerify';
import { CertifiedActionProcess } from './CertifiedActionProcess';

async function  DoCertifiedSale(sale: CertifiedTransfer) {

  CertifiedActionVerify(sale);
    
  //console.log(`e-Transfer from ${clientEmail}`);
    
  // Process the action
  return await CertifiedActionProcess(sale, "Sell");
}

export { DoCertifiedSale }
