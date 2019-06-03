import Wallet from './Wallet';
import status from './status.json';
import { TheContract } from '@the-coin/utilities';
import { GetTransferSigner } from '@the-coin/utilities/lib/VerifiedTransfer';
import { BrokerCAD } from '@the-coin/types';

function success(val: string) : BrokerCAD.CertifiedTransferResponse{
	return {
			message : "Success",
			txHash: val
	}
}
function failure(val: string) : BrokerCAD.CertifiedTransferResponse {
	return {
			message : val,
			txHash: ""
	}
}

function FeeValid(transfer : BrokerCAD.CertifiedTransferRequest) {
	return transfer.fee == status.certifiedFee;
}
async function AvailableBalance(transfer : BrokerCAD.CertifiedTransferRequest) {
    const userBalance = await TheContract.GetContract().balanceOf(transfer.from)
    return (userBalance.toNumber() >= (transfer.fee + transfer.value))
}
function ValidXfer(transfer : BrokerCAD.CertifiedTransferRequest) {
	return GetTransferSigner(transfer) == transfer.from;
}

async function DoCertifiedTransferWaitable(transfer: BrokerCAD.CertifiedTransferRequest) {

    // First check: is this the right sized fee?
    if (!FeeValid(transfer)) // TODO: Is that even remotely the right size?
        return failure("Invalid fee present")

    // Next, verify the xfer request
    if (!ValidXfer(transfer))
        return failure("Invalid xfer");

    // Next, check that user have available balance
    if (!await AvailableBalance(transfer))
        return failure("Insufficient funds");

    const {from, to, value, fee, timestamp } = transfer;
    const tc = await Wallet.GetContract();
    const gasAmount = await tc.estimate.certifiedTransfer(from, to, value, fee, timestamp, transfer.signature)
    console.log(`Tx ${from} -> ${to}: Gas Amount ${gasAmount.toString()}`);
    let tx = await tc.certifiedTransfer(from, to, value, fee, timestamp, transfer.signature);
    console.log(`TxHash: ${tx.hash}`);
    // Return the full tx
    return tx;
}

export { DoCertifiedTransferWaitable };