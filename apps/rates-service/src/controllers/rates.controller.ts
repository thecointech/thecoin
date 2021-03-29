import { Controller, Get, Route, Response, Path, Query, Tags } from 'tsoa';
import { getCombinedRates, getLatestCombinedRates, getManyRates } from '../internals/rates';
import { FXRate } from '../internals/rates/types';

@Route('')
@Tags('Rates')
export class RatesController extends Controller {

  /**
   * Query a single value
   **/
  @Get('rates/{currencyCode}')
  @Response('204', 'Success')
  @Response('405', 'unknown exception')
  async getSingle(
    @Path() currencyCode: number,
    @Query() timestamp?: number)
    : Promise<FXRate>
  {
    try {
      // First try and return the correct rate
      const correct = await getCombinedRates(timestamp);
      if (correct)
        return correct;
    } catch (e) {
      // If something has gone wrong, we eat the exception
      console.error(`Getting rates failed for ${currencyCode}: ${JSON.stringify(e)}`);
    }
    // We must always return rates, so one last attempt
    console.error("Failed fetching rates, defaulting to latest");
    return getLatestCombinedRates();
  }

  /**
   * Query many values simultaneously
   **/
  @Get('many')
  @Response('204', 'Success')
  @Response('405', 'unknown exception')
  async getMany(
    @Query() timestamps: number[])
    : Promise<FXRate[]>
  {
    return await getManyRates(timestamps);
  }
}
