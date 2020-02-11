import ServerStatus from '../status/Status.json';
import { Controller, Get, Route } from 'tsoa';

@Route('status')
export class StatusController extends Controller {

  @Get('')
  async status() {
    return ServerStatus;
  }

}

