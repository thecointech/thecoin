import { BrokerCAD } from "@the-coin/types";
import { TransactionResponse } from "ethers/providers";
import { DoCertifiedTransferWaitable } from "./VerifiedTransfer";
import { GetActionDoc, GetActionRef, UserAction } from "@the-coin/utilities/lib/User";
import { ProcessRecord } from "@the-coin/utilities/lib/Firestore";
import { DocumentReference } from "@the-coin/utilities/lib/FirebaseFirestore";
import { firestore } from "firebase-admin";

interface CertifiedAction {
	transfer: BrokerCAD.CertifiedTransferRequest
}
type ConfirmedRecord = CertifiedAction & ProcessRecord;

interface VerifiedActionResult {
	doc: DocumentReference,
	hash: string
}

// Store the xfer info
async function StoreActionRequest(actionData: CertifiedAction, actionType: UserAction, hash: string)
{
    const user = actionData.transfer.from;

    const actionDoc = GetActionDoc(user, actionType, hash);
    const data: ConfirmedRecord = {
        ...actionData,
        recievedTimestamp: firestore.Timestamp.now(), 
        hash: hash,
        confirmed: false,
        fiatDisbursed: 0
    }
    await actionDoc.set(data);
    return actionDoc;
}

// We store an additional link to the new action
// in a separate collection.  This is essentially
// the pool of un-completed actions
function StoreActionLink(path: string, actionType: UserAction, hash: string)
{
  const doc = GetActionRef(actionType, hash);
	return doc.set({
		ref: path
	})
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

async function  ProcessCertifiedAction(actionData: CertifiedAction, actionType: UserAction): Promise<VerifiedActionResult> {
    const { transfer } = actionData;
    
    // Do the CertTransfer, this should transfer Coin to our account
    const res = await DoCertifiedTransferWaitable(transfer);
    if (!res.hash)
    {
        console.error("Tx missing hash: " + JSON.stringify(res));
        throw new Error("Unknown problem with returned value from DoCertTransfer")
    }

	// Next, create an initial record of the transaction
    const actionDoc = await StoreActionRequest(actionData, actionType, res.hash);
    console.log(`Valid Cert Xfer: id: ${actionDoc.id}`);

    await StoreActionLink(actionDoc.path, actionType, res.hash);
        
    // Fire & Forget callback waits for res to be mined & updates DB
    ConfirmAction(res, actionDoc);

    // We just return the hash.  This guaranteed to be valid by DoCertTransferWaitable
    return {
        doc: actionDoc,
        hash: res.hash
	}
}

export { ProcessCertifiedAction, ConfirmedRecord, VerifiedActionResult }
