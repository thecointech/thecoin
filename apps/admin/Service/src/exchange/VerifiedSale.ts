import { BrokerCAD } from '@the-coin/types';
import { NormalizeAddress } from '@the-coin/utilities';
import { GetSaleSigner } from '@the-coin/utilities/lib/VerifiedSale';
import { ProcessCertifiedAction, ConfirmedRecord } from './VerifiedProcess';
import status from './status.json';

type VerifiedSaleRecord = BrokerCAD.CertifiedSale&ConfirmedRecord;

const ValidSale = (sale: BrokerCAD.CertifiedSale) => {
    var saleSigner = GetSaleSigner(sale);
    return (NormalizeAddress(saleSigner) == NormalizeAddress(sale.transfer.from))
}
const ValidDestination = (transfer: BrokerCAD.CertifiedTransferRequest) => 
    NormalizeAddress(transfer.to) == NormalizeAddress(status.address);

async function  DoCertifiedSale(sale: BrokerCAD.CertifiedSale) {
    const { transfer, clientEmail, signature } = sale;
    if (!transfer || !clientEmail || !signature) 
        throw new Error("Invalid arguments");
    
    console.log(`Cert Sale from ${clientEmail}`);
    
    // First, verify the email address
    if (!ValidSale(sale))
        throw new Error("Invalid data");

    // Finally, verify that the transfer recipient is the Broker CAD
    if (!ValidDestination(transfer))
        throw new Error("Invalid Destination");

    // Process the action
    return await ProcessCertifiedAction(sale, "Sell");
}

export { DoCertifiedSale, VerifiedSaleRecord }
