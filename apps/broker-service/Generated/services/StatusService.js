/* eslint-disable no-unused-vars */
const Service = require('./Service');

class StatusService {

  /**
   * Gets the operating status of the broker
   * Returns info like brokers address, available balance, etc (?)
   *
   * returns BrokerStatus
   **/
  static status() {
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

module.exports = StatusService;
