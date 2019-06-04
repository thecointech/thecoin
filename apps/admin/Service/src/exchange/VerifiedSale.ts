import { BrokerCAD } from '@the-coin/types';
import { NormalizeAddress } from '@the-coin/utilities';
import { GetSaleSigner } from '@the-coin/utilities/lib/VerifiedSale';
import status from './status.json';
import { failure } from './VerifiedTransfer';
import { ProcessCertifiedAction } from './VerifiedProcess';

const ValidSale = (sale: BrokerCAD.CertifiedSale) => {
    var saleSigner = GetSaleSigner(sale);
    return (NormalizeAddress(saleSigner) == NormalizeAddress(sale.transfer.from))
}
const ValidDestination = (transfer: BrokerCAD.CertifiedTransferRequest) => 
    NormalizeAddress(transfer.to) == NormalizeAddress(status.address);

async function  DoCertifiedSale(sale: BrokerCAD.CertifiedSale) {
    const { transfer, clientEmail, signature } = sale;
    if (!transfer || !clientEmail || !signature) 
        return failure("Invalid arguments");
    
    console.log(`Cert Sale from ${clientEmail}`);
    
    // First, verify the email address
    if (!ValidSale(sale))
        throw "Invalid data";

    // Finally, verify that the transfer recipient is the Broker CAD
    if (!ValidDestination(transfer))
        throw "Invalid Destination";

    // Process the action
    return await ProcessCertifiedAction(sale, "Sell");
}

export { DoCertifiedSale }
