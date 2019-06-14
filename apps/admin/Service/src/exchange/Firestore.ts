import { Firestore, Settings } from '@google-cloud/firestore';
import { IsValidReferrerId, IsValidAddress, NormalizeAddress } from '@the-coin/utilities';

const settings: Settings = {
	projectId: 'broker-cad', // project id is random for each run
};
const firestore = new Firestore(settings);

function GetUserDoc(address: string) {
	if (!IsValidAddress(address))
	{
			console.error(`${address} is not a valid address`);
			throw new Error("Invalid address");
	}
	return firestore.collection("User").doc(NormalizeAddress(address));
}

export {firestore, GetReferrerDoc, GetUserDoc};