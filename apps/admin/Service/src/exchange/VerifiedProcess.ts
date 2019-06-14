import { BrokerCAD } from "@the-coin/types";
import { TransactionResponse } from "ethers/providers";
import { DoCertifiedTransferWaitable } from "./VerifiedTransfer";
import { GetUserDoc } from "./Firestore";
import { DocumentReference, FieldValue } from "@google-cloud/firestore";

function GetActionDoc(user: string, action: string, hash: string) { 
    const userDoc = GetUserDoc(user);
    return userDoc.collection(action).doc(hash);
}

interface CertifiedAction {
	transfer: BrokerCAD.CertifiedTransferRequest
}

interface ConfirmedRecord extends CertifiedAction { 
    processedTimestamp: FieldValue,
    hash: string,
    confirmed: boolean,
    fiatDisbursed: number
}

interface VerifiedActionResult {
	doc: DocumentReference,
	hash: string
}

// Store the xfer info
async function StoreActionRequest(actionData: CertifiedAction, actionType: string, hash: string)
{
    const user = actionData.transfer.from;

    const actionDoc = GetActionDoc(user, actionType, hash);
    const data: ConfirmedRecord = {
        ...actionData,
        processedTimestamp: FieldValue.serverTimestamp(), 
        hash: hash,
        confirmed: false,
        fiatDisbursed: 0
    }
    await actionDoc.set(data);
    return actionDoc;
}

async function ConfirmAction(tx: TransactionResponse, actionDoc: DocumentReference)
{
    // Wait for two confirmations.  This makes it more
    // difficult for an external actor to feed us false info
    // https://docs.ethers.io/ethers.js/html/cookbook-contracts.html?highlight=transaction
    const res = await tx.wait(2);
    console.log(`Tx ${tx.hash} mined ${res.blockNumber}`);
    // We just save that it was confirmed: should we also save the block number?
    await actionDoc.update({
        confirmed: !!res.status
    })
    console.log(`Tx Confirmed: ${res.status}`);
}

async function  ProcessCertifiedAction(actionData: CertifiedAction, actionType: string): Promise<VerifiedActionResult> {
    const { transfer } = actionData;
    
    // Do the CertTransfer, this should transfer Coin to our account
    const res = await DoCertifiedTransferWaitable(transfer);

		// Next, create an initial record of the transaction
    const actionDoc = await StoreActionRequest(actionData, actionType, res.hash!);
    console.log(`Valid Cert Xfer: id: ${actionDoc.id}`);
        
    // Fire & Forget callback waits for res to be mined & updates DB
    ConfirmAction(res, actionDoc);

    // We just return the hash.  This guaranteed to be valid by DoCertTransferWaitable
    return {
			doc: actionDoc,
			hash: res.hash!
		}
}

export { ProcessCertifiedAction, ConfirmedRecord }
