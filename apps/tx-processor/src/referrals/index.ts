import { log } from '@thecointech/logging';
import { getUsersPendingReferral, getUsersWithUniqueIdSig } from '@thecointech/broker-db/user';
import { createReferrer } from '@thecointech/broker-db/referrals';
import { SendMail } from '@thecointech/email';
import { getSigner } from '@thecointech/signers';
import { getAddressShortCodeSig } from '@thecointech/utilities';

//
// Process all referrals.  This function is responsible
// for assigning referral codes to any newly-approved
// accounts, and for (eventually) distributing referral bonuses
export async function processReferrals() {

  log.trace('Processing Referrals...');
  // get newly verified accounts
  const newlyVerified = await getUsersPendingReferral();

  // for each account, let's create & assign a referral code
  for (const {address, uniqueIdSig} of newlyVerified) {
    const code = await generateReferralCode(address, uniqueIdSig!);
    log.debug({address}, `Generated referral code (${code}) for {address}`);

    // Now!  You could do something neat like pay out a referral bonus.
  }

  log.trace(`Processed ${newlyVerified.length} referrals`);
}

// If the user is unique, automatically generate referral code
export async function generateReferralCode(address: string, uniqueIdSig: string) {

  if (await findDuplicates(address, uniqueIdSig)) {
    return null;
  }

  // Ok, no duplicates, generate address short code
  const signer = await getSigner("BrokerCAD");
  const sig = await getAddressShortCodeSig(address, signer);
  return await createReferrer(sig, address);
}
