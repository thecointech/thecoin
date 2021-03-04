import { NewsletterApi, SubscriptionDetails } from "@the-coin/broker-cad";
import { Dictionary } from 'lodash';
import { buildResponse, delay } from '@the-coin/site-base/api/mock/utils';

const subscriptions = {} as Dictionary<SubscriptionDetails>;
const randomId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

export class MockNewsletterApi implements Pick<NewsletterApi, keyof NewsletterApi> {
  /**
   *
   * @summary Confirm email subscription.
   * @param {SubscriptionDetails} details
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NewsletterApi
   */
  async newsletterUpdate(id: string, details: SubscriptionDetails, _options?: any) {
    await delay(250);
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
    await delay(250);
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
    subscriptions[id] = { email };
    await delay(250);
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
    await delay(250);
    return buildResponse({
      success: true
    });
  }
}
