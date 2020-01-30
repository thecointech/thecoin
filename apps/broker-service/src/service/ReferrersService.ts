import { NewAccountReferal, BoolResponse } from "@the-coin/types";
import { CreateReferree, GetReferrerData } from '@the-coin/utilities/Referrals'
import { Timestamp } from "@google-cloud/firestore";

/**
 * Register the referral of new account
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referral NewAccountReferal Set referal for new account
 * returns BoolResponse
 **/
export async function referralCreate(referral: NewAccountReferal): Promise<BoolResponse> {
  try {
    var now = Timestamp.now();
    await CreateReferree(referral, now);
    return {
      success: true
    };
  } catch(err) {
    console.error(err);
    throw new Error('Server Error');
  }
}


/**
 * Gets the validity of the passed referrer
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referrer String Referrers ID.  This ID must have been previously registered with the system
 * returns BoolResponse
 **/
export async function referrerValid(referrerId: string): Promise<BoolResponse> {
  try {
    const referrer = await GetReferrerData(referrerId);
    return {
      success: !!referrer
    };
  }
  catch(err) {
    console.error(err);
    throw new Error('Server Error');
  }
}

