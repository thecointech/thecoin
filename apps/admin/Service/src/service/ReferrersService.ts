import { BrokerCAD } from "@the-coin/types";
import { Create, GetReferrerById } from '../exchange/Referrers';

/**
 * Register the referral of new account
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referral NewAccountReferal Set referal for new account
 * returns BoolResponse
 **/
export async function referralCreate(referral: BrokerCAD.NewAccountReferal): Promise<BrokerCAD.BoolResponse> {
  try {
    const created = await Create(referral);
    return {
      success: created
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
    const address = await GetReferrerById(referrerId);
    return {
      success: !!address
    };
  }
  catch(err) {
    console.error(err);
    throw new Error('Server Error');
  }
}

