const Controller = require('./Controller');

class SecureController {
  constructor(Service) {
    this.service = Service;
  }

  async googleAuthUrl(request, response) {
    await Controller.handleRequest(request, response, this.service.googleAuthUrl);
  }

  async googleList(request, response) {
    await Controller.handleRequest(request, response, this.service.googleList);
  }

  async googlePut(request, response) {
    await Controller.handleRequest(request, response, this.service.googlePut);
  }

  async googleRetrieve(request, response) {
    await Controller.handleRequest(request, response, this.service.googleRetrieve);
  }

}

module.exports = SecureController;
