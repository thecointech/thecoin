/* eslint-disable no-unused-vars */
const Service = require('./Service');

class TransferService {

  /**
   * Transfer to another The Coin account
   * A client may request that the Broker initiate a transfer from their account to another.  The transfer includes a fee paid to the broker to cover the cost of the transfer.  This allows a user to operate on the Ethereum blockchain without requiring their own ether
   *
   * request CertifiedTransferRequest A request appropriately filled out and signed as described in the comments
   * returns CertifiedTransferResponse
   **/
  static transfer({ request }) {
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

module.exports = TransferService;
