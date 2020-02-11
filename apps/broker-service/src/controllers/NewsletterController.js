import { Controller, Get, Route, Query, Body, Post, Response } from 'tsoa';

const Controller = require('./Controller');

class NewsletterController {
  constructor(Service) {
    this.service = Service;
  }

  async newsletterConfirm(request, response) {
    await Controller.handleRequest(request, response, this.service.newsletterConfirm);
  }

  async newsletterDetails(request, response) {
    await Controller.handleRequest(request, response, this.service.newsletterDetails);
  }

  async newsletterSignup(request, response) {
    await Controller.handleRequest(request, response, this.service.newsletterSignup);
  }

  async newsletterUnsubscribe(request, response) {
    await Controller.handleRequest(request, response, this.service.newsletterUnsubscribe);
  }

}

module.exports = NewsletterController;
