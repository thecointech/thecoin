import { current } from '../status';
import { Controller, Get, Route, Response, Tags } from '@tsoa/runtime';

@Route('status')
@Tags('Status')
export class StatusController extends Controller {

  /**
  * Returns info like brokers address, available balance, etc (?)
  * Gets the operating status of the broker
  **/
  @Get()
  @Response('200', 'Server status')
  async status() {
    const status = await current();
    return {
      certifiedFee: status.certifiedFee,
      address: status.BrokerCAD,
    }
  }
}
