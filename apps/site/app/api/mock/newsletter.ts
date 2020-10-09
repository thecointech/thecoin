import { SubscriptionDetails } from "@the-coin/broker-cad";
import { delay } from "redux-saga/effects";

export class MockNewsletterApi {
    /**
     *
     * @summary Confirm email subscription.
     * @param {SubscriptionDetails} details
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    public async newsletterConfirm(_details: SubscriptionDetails, _options?: any)
    {
        await delay(250);
        return {
          success: true,
          data: {}
        };
    }
    /**
     *
     * @summary Get subscription details.
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    public async newsletterDetails(_id: string, _options?: any){
        await delay(250);
        return {
          success: true
        };
    }
    /**
     *
     * @summary Register an email address for our newsletter.
     * @param {SubscriptionDetails} details
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    public async newsletterSignup(_details: SubscriptionDetails, _options?: any){
        await delay(250);
        return {
          success: true
        };
    }
    /**
     *
     * @summary Unsubscribe an email address from our newsletter.
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    public async newsletterUnsubscribe(_id: string, _options?: any){
        await delay(250);
        return {
          success: true
        };
    }
} 