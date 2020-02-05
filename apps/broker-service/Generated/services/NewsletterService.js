/* eslint-disable no-unused-vars */
const Service = require('./Service');

class NewsletterService {

  /**
   * Confirm email subscription.
   *
   * details SubscriptionDetails 
   * returns SubscriptionDetails
   **/
  static newsletterConfirm({ details }) {
    return new Promise(
      async (resolve) => {
        try {
          resolve(Service.successResponse(''));
        } catch (e) {
          resolve(Service.rejectResponse(
            e.message || 'Invalid input',
            e.status || 405,
          ));
        }
      },
    );
  }

  /**
   * Get subscription details.
   *
   * id String 
   * returns SubscriptionDetails
   **/
  static newsletterDetails({ id }) {
    return new Promise(
      async (resolve) => {
        try {
          resolve(Service.successResponse(''));
        } catch (e) {
          resolve(Service.rejectResponse(
            e.message || 'Invalid input',
            e.status || 405,
          ));
        }
      },
    );
  }

  /**
   * Register an email address for our newsletter.
   *
   * details SubscriptionDetails 
   * returns Boolean
   **/
  static newsletterSignup({ details }) {
    return new Promise(
      async (resolve) => {
        try {
          resolve(Service.successResponse(''));
        } catch (e) {
          resolve(Service.rejectResponse(
            e.message || 'Invalid input',
            e.status || 405,
          ));
        }
      },
    );
  }

  /**
   * Unsubscribe an email address from our newsletter.
   *
   * id String 
   * returns Boolean
   **/
  static newsletterUnsubscribe({ id }) {
    return new Promise(
      async (resolve) => {
        try {
          resolve(Service.successResponse(''));
        } catch (e) {
          resolve(Service.rejectResponse(
            e.message || 'Invalid input',
            e.status || 405,
          ));
        }
      },
    );
  }

}

module.exports = NewsletterService;
