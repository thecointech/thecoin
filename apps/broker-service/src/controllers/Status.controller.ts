import { current } from '../status';
import { Controller, Get, Route, Response, Tags } from '@tsoa/runtime';
import { DateTime } from 'luxon';

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

  /**
  * Get server-side timestamp.  Used to ensure a client can always
  * get a valid timestamp/signature combo, even if their clock is out
  **/
  @Get('/ts')
  @Response<number>(200, "Here ya go")
  async timestamp(): Promise<number> {
    return DateTime.now().toMillis();
  }
}
