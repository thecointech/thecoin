import ServerStatus from '../status/Status.json';
import { Controller, Get, Route, Response } from 'tsoa';

@Route('status')
export class StatusController extends Controller {

  /** 
  * Returns info like brokers address, available balance, etc (?)
  * Gets the operating status of the broker
  **/
  @Get()
  @Response('200', 'Server status')
  @Response('400', 'Bad request')
  @Response('405', 'Server Error')
  async status() {
    return ServerStatus;
  }
}