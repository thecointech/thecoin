import { NewsletterApi as SrcApi, SubscriptionDetails } from "@thecointech/broker-cad";
import { Dictionary } from 'lodash';
import { buildResponse } from '../axios-utils';
import { sleep } from '@thecointech/async';

const subscriptions = {} as Dictionary<SubscriptionDetails>;
const randomId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

export class NewsletterApi implements Pick<SrcApi, keyof SrcApi> {
  /**
   *
   * @summary Confirm email subscription.
   * @param {SubscriptionDetails} details
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NewsletterApi
   */
  async newsletterUpdate(id: string, details: SubscriptionDetails, _options?: any) {
    await sleep(250);
    subscriptions[id] = details;
    return buildResponse(details);
  }
  /**
   *
   * @summary Get subscription details.
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NewsletterApi
   */
  async newsletterDetails(id: string, _options?: any) {
    await sleep(250);
    return buildResponse(subscriptions[id]);
  }
  /**
   *
   * @summary Register an email address for our newsletter.
   * @param {SubscriptionDetails} details
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NewsletterApi
   */
  async newsletterSignup(email: string, _options?: any) {
    const id = randomId();
    subscriptions[id] = {
      email,
      registerDate: Date.now()
    };
    await sleep(250);
    setTimeout(() => {
      alert('Simulating redirection to confirmation page');
      // Redirect to confirm page normally send via email
      window.location.href = `/#/newsletter/confirm?id=${id}`;
    }, 3000);
    return buildResponse({
      success: true
    });
  }

  /**
   *
   * @summary Unsubscribe an email address from our newsletter.
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NewsletterApi
   */
  async newsletterUnsubscribe(id: string, _options?: any) {
    delete subscriptions[id];
    await sleep(250);
    return buildResponse({
      success: true
    });
  }
}
