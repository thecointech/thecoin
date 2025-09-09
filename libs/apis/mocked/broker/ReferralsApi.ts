import type { ReferralsApi as SrcApi, ReferralCreateRequest } from "@thecointech/broker-cad";
import { buildResponse } from "../axios-utils";
import { sleep } from '@thecointech/async';

export class ReferralsApi implements Pick<SrcApi, keyof SrcApi>
{
    /**
     * Returns a boolean indicating whether the passed referrer is valid
     * @summary Register the referral of new account
     * @param {NewAccountReferal} referral Set referal for new account
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ReferralsApi
     */
    async referralCreate(_referral: ReferralCreateRequest, _options?: any)
    {
      await sleep(250);
      return buildResponse({
        success: true
      });
    }
    /**
     * Returns a boolean indicating whether the passed referrer is valid
     * @summary Gets the validity of the passed referrer
     * @param {string} referrer Referrers ID.  This ID must have been previously registered with the system
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ReferralsApi
     */
    async referrerValid(_referrer: string, _options?: any)
    {
      await sleep(250);
      return buildResponse({
        success: _referrer.length === 6
      });
    }
}
