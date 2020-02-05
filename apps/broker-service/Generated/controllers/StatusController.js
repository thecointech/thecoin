const Controller = require('./Controller');

class StatusController {
  constructor(Service) {
    this.service = Service;
  }

  async status(request, response) {
    await Controller.handleRequest(request, response, this.service.status);
  }

}

module.exports = StatusController;
