/* eslint-disable no-unused-vars */
const Service = require('./Service');

class BillPaymentsService {

  /**
   * Bill Payment
   * Called by the client to pay a bill with coin via a certified transfer
   *
   * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted BillPayeePacket
   * returns CertifiedTransferResponse
   **/
  static billPayment({ request }) {
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

module.exports = BillPaymentsService;
