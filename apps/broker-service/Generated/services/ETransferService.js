/* eslint-disable no-unused-vars */
const Service = require('./Service');

class ETransferService {

  /**
   * Request eTransfer
   * Called by the client to exchange coin for CAD and send via eTransfer
   *
   * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
   * returns CertifiedTransferResponse
   **/
  static eTransfer({ request }) {
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
   * Required answer for eTransfer sent to this broker
   * A code unique to the user that is required on all eTransfers sent in to this broker
   *
   * request SignedMessage Signed timestamp message
   * returns eTransferCodeResponse
   **/
  static eTransferInCode({ request }) {
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

module.exports = ETransferService;
