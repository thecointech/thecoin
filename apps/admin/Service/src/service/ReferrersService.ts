import { BrokerCAD } from "@the-coin/types";
import { CreateReferree, GetReferrerData } from '@the-coin/utilities/lib/Referrals'

/**
 * Register the referral of new account
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referral NewAccountReferal Set referal for new account
 * returns BoolResponse
 **/
export async function referralCreate(referral: BrokerCAD.NewAccountReferal): Promise<BrokerCAD.BoolResponse> {
  try {
    await CreateReferree(referral);
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
export async function referrerValid(referrerId: string): Promise<BrokerCAD.BoolResponse> {
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

