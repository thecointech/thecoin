const Controller = require('./Controller');

class TransferController {
  constructor(Service) {
    this.service = Service;
  }

  async transfer(request, response) {
    await Controller.handleRequest(request, response, this.service.transfer);
  }

}

module.exports = TransferController;
