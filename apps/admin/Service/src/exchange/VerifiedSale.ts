import {datastore} from './Datastore'
import { BrokerCAD } from '@the-coin/types';
import { NormalizeAddress } from '@the-coin/utilities';
import { GetSaleSigner } from '@the-coin/utilities/lib/VerifiedSale';
import status from './status.json';
import { failure, DoCertifiedTransferWaitable, success, isTx } from './VerifiedTransfer';
import { DatastoreKey } from '@google-cloud/datastore/entity';
import { TransactionResponse } from 'ethers/providers';

function BuildSellKey(user: string, id: string) { return datastore.key(['User', user, 'Sell', Number(id)]) }

interface SaleRecord extends BrokerCAD.CertifiedSale {
    processedTimestamp: number,
    hash: string,
    confirmed: boolean,
    fiatDisbursed: number
}

// Store the xfer info
async function StoreRequest(sale: BrokerCAD.CertifiedSale, hash: string)
{
    const user = sale.transfer.from;
    const baseKey = datastore.key(['User', user, 'Sell']);
    const [keys] = await datastore.allocateIds(baseKey, 1);

    const saleId = keys[0];
    const saleKey = BuildSellKey(user, saleId.id!);
    const data: SaleRecord = {
        ...sale,
        processedTimestamp: Date.now(), 
        hash: hash,
        confirmed: false,
        fiatDisbursed: 0
    }
    const entities = [
        {
            key: saleKey,
            data
        }
    ];
    await datastore.insert(entities)
    return saleKey;
}

async function ConfirmSale(tx: TransactionResponse, saleKey: DatastoreKey)
{
    // Wait for two confirmations.  This makes it more
    // difficult for an external actor to feed us false info
    // https://docs.ethers.io/ethers.js/html/cookbook-contracts.html?highlight=transaction
    const res = await tx.wait(2);
    console.log(`Tx ${tx.hash} mined ${res.blockNumber}`);

    let [current]= await datastore.get(saleKey);
    if (!current) {
        console.error("Could not load datastore entity: " + JSON.stringify(saleKey));
        return;
    }
    let record = current as SaleRecord;
    record.confirmed = !!res.status;

    await datastore.update({
        key: saleKey,
        data: current
    });
    console.log(`Tx Confirmed: ${res.status}`);
}


const ValidSale = (sale: BrokerCAD.CertifiedSale) => {
    var saleSigner = GetSaleSigner(sale);
    return (NormalizeAddress(saleSigner) == NormalizeAddress(sale.transfer.from))
}
const ValidDestination = (transfer: BrokerCAD.CertifiedTransferRequest) => 
    NormalizeAddress(transfer.to) == NormalizeAddress(status.address);

async function  DoCertifiedSale(sale: BrokerCAD.CertifiedSale) : Promise<BrokerCAD.CertifiedTransferResponse> {
    const { transfer, clientEmail, signature } = sale;
    if (!transfer || !clientEmail || !signature) 
        return failure("Invalid arguments");
    
    console.log(`Cert Sale from ${clientEmail}`);
    
    // First, verify the email address
    if (!ValidSale(sale))
        return failure("Invalid data");

    // Finally, verify that the transfer recipient is the Broker CAD
    if (!ValidDestination(transfer))
        return failure("Invalid Destination");

    // Do the CertTransfer, this should transfer Coin to our account
    const res = await DoCertifiedTransferWaitable(transfer);
    // If we have no hash, it's probably an error message
    if (!isTx(res))
        return res;

    // Next, create an initial record of the transaction
    const saleKey = await StoreRequest(sale, res.hash!);
    console.log(`Valid Cert Xfer: id: ${saleKey.id}`);
        
    // Fire & Forget callback waits for res to be mined & updates DB
    ConfirmSale(res, saleKey);

    // We just return the hash
    return success(res.hash);
}

function ServerStatus() {
    return status;
}

export { BuildSellKey, DoCertifiedSale, ServerStatus}
