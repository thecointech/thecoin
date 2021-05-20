import { Controller, Response, Tags, Post, Body, Route } from '@tsoa/runtime';
import { gasslessUpdate } from '../nft/gassless';
import type { GasslessUpdateRequest } from '@thecointech/nft-contract';

@Route('/nft')
export class NftController extends Controller {

  /**
   * Perform a gassless update of an NFT's metadata
   **/
  @Post('metadata')
  @Response('204', 'Success')
  @Response('500', 'unknown exception')
  async updateMetadata(@Body() update: GasslessUpdateRequest) : Promise<Boolean>
  {
    return gasslessUpdate(update);
  }
}

