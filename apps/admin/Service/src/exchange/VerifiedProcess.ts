import { BrokerCAD } from "@the-coin/types";
import { TransactionResponse } from "ethers/providers";
import { DatastoreKey } from "@google-cloud/datastore/entity";
import { GetSaleSigner } from "@the-coin/utilities/lib/VerifiedSale";
import { NormalizeAddress } from "@the-coin/utilities";
import { failure, DoCertifiedTransferWaitable, isTx, success } from "./VerifiedTransfer";
import {datastore} from './Datastore'
import status from './status.json';

function BuildActionKey(user: string, action: string, id: number) { return datastore.key(['User', user, action, id]) }

interface CertifiedAction {
	transfer: BrokerCAD.CertifiedTransferRequest
}

interface ConfirmedRecord extends CertifiedAction { 
    processedTimestamp: number,
    hash: string,
    confirmed: boolean,
    fiatDisbursed: number
}

// Store the xfer info
async function StoreActionRequest(actionData: CertifiedAction, actionType: string, hash: string)
{
    const user = actionData.transfer.from;
    const baseKey = datastore.key(['User', user, actionType]);
    const [keys] = await datastore.allocateIds(baseKey, 1);

    const saleId = keys[0];
    const saleKey = BuildActionKey(user, actionType, Number(saleId.id!));
    const data: ConfirmedRecord = {
        ...actionData,
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

async function ConfirmAction(tx: TransactionResponse, saleKey: DatastoreKey)
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
    let record = current as ConfirmedRecord;
    record.confirmed = !!res.status;

    await datastore.update({
        key: saleKey,
        data: current
    });
    console.log(`Tx Confirmed: ${res.status}`);
}

async function  ProcessCertifiedAction(actionData: CertifiedAction, actionType: string) {
    const { transfer } = actionData;
    
    // Do the CertTransfer, this should transfer Coin to our account
    const res = await DoCertifiedTransferWaitable(transfer);

		// Next, create an initial record of the transaction
    const saleKey = await StoreActionRequest(actionData, actionType, res.hash!);
    console.log(`Valid Cert Xfer: id: ${saleKey.id}`);
        
    // Fire & Forget callback waits for res to be mined & updates DB
    ConfirmAction(res, saleKey);

    // We just return the hash.  This guaranteed to be valid by DoCertTransferWaitable
    return res.hash!;
}

export { BuildActionKey, ProcessCertifiedAction }
