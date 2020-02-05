const Controller = require('./Controller');

class ETransferController {
  constructor(Service) {
    this.service = Service;
  }

  async eTransfer(request, response) {
    await Controller.handleRequest(request, response, this.service.eTransfer);
  }

  async eTransferInCode(request, response) {
    await Controller.handleRequest(request, response, this.service.eTransferInCode);
  }

}

module.exports = ETransferController;
