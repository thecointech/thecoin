import { SubscriptionDetails } from "@the-coin/broker-cad";
import { AxiosPromise } from "axios";
import { BaseAPI } from "@the-coin/broker-cad/dist/base";

export declare class NewsletterApi extends BaseAPI {
    /**
     *
     * @summary Confirm email subscription.
     * @param {SubscriptionDetails} details
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    newsletterConfirm(details: SubscriptionDetails, options?: any): AxiosPromise<SubscriptionDetails>;
    /**
     *
     * @summary Get subscription details.
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    newsletterDetails(id: string, options?: any): AxiosPromise<SubscriptionDetails>;
    /**
     *
     * @summary Register an email address for our newsletter.
     * @param {SubscriptionDetails} details
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    newsletterSignup(details: SubscriptionDetails, options?: any): AxiosPromise<boolean>;
    /**
     *
     * @summary Unsubscribe an email address from our newsletter.
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewsletterApi
     */
    newsletterUnsubscribe(id: string, options?: any): AxiosPromise<boolean>;
} 