const Controller = require('./Controller');

class BillPaymentsController {
  constructor(Service) {
    this.service = Service;
  }

  async billPayment(request, response) {
    await Controller.handleRequest(request, response, this.service.billPayment);
  }

}

module.exports = BillPaymentsController;
