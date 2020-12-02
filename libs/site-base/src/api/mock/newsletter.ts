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
          data: { email: "marie@thecoin.io", firstName: "Marie", lastName: "TheCoin", country: "Canada", city: "Montreal" }
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
          success: true,
          data: { email: "marie@thecoin.io", firstName: "Marie", lastName: "TheCoin", country: "Canada", city: "Montreal" }
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
        await delay(550);
        //Redirect to confirm page normally send via email
        window.location.href = "http://localhost:3000/#/newsletter/confirm?id=PIyts3z2cwVSkAG";
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