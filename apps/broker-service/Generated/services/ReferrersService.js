/* eslint-disable no-unused-vars */
const Service = require('./Service');

class ReferrersService {

  /**
   * Register the referral of new account
   * Returns a boolean indicating whether the passed referrer is valid
   *
   * referral NewAccountReferal Set referal for new account
   * returns Boolean
   **/
  static referralCreate({ referral }) {
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
   * Gets the validity of the passed referrer
   * Returns a boolean indicating whether the passed referrer is valid
   *
   * referrer String Referrers ID.  This ID must have been previously registered with the system
   * returns Boolean
   **/
  static referrerValid({ referrer }) {
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

module.exports = ReferrersService;
