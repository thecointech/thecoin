const Controller = require('./Controller');

class ReferrersController {
  constructor(Service) {
    this.service = Service;
  }

  async referralCreate(request, response) {
    await Controller.handleRequest(request, response, this.service.referralCreate);
  }

  async referrerValid(request, response) {
    await Controller.handleRequest(request, response, this.service.referrerValid);
  }

}

module.exports = ReferrersController;
