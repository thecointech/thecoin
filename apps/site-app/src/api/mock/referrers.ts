import { ReferralsApi, NewAccountReferal } from "@thecointech/broker-cad";
import { buildResponse, delay } from "@thecointech/site-base/api/mock/utils";

export class MockReferrersApi implements Pick<ReferralsApi, keyof ReferralsApi>
{
    /**
     * Returns a boolean indicating whether the passed referrer is valid
     * @summary Register the referral of new account
     * @param {NewAccountReferal} referral Set referal for new account
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ReferrersApi
     */
    async referralCreate(_referral: NewAccountReferal, _options?: any)
    {
      await delay(250);
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
     * @memberof ReferrersApi
     */
    async referrerValid(_referrer: string, _options?: any)
    {
      await delay(250);
      return buildResponse({
        success: _referrer.length === 6
      });
    }
}
