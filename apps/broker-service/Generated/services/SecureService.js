/* eslint-disable no-unused-vars */
const Service = require('./Service');

class SecureService {

  /**
   * Get the authorization URL to redirect the user to
   *
   * returns GoogleAuthUrl
   **/
  static googleAuthUrl() {
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
   * Get the listing of available accounts
   *
   * token GoogleToken 
   * returns GoogleListResult
   **/
  static googleList({ token }) {
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
   * Store on google drive
   *
   * uploadPacket GoogleStoreAccount 
   * returns Boolean
   **/
  static googlePut({ uploadPacket }) {
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
   * Retrieve previously-stored file from google drive
   *
   * token GoogleToken 
   * returns GoogleGetResult
   **/
  static googleRetrieve({ token }) {
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

module.exports = SecureService;
