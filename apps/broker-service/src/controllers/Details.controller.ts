import { Controller, Route, Put, Get, Response, Tags, Body, Query } from '@tsoa/runtime';
import { getSigner } from '../signedTimestamp';
import { getDetails, putDetails } from '../details';
import { RateLimitError,  type AllUserData } from '@thecointech/broker-db';
import type { EncryptedBlob } from '@thecointech/account-details/types';
import type { BoolResponse } from '../types';

export type DetailsResponse = {
  // Encrypted profile blob (decryptable by the user only)
  preferences?: EncryptedBlob;
  // Basic data (status, referral code, etc.)
  basic?: AllUserData;
}

@Route('details')
@Tags('Details')
export class DetailsController extends Controller {

  /**
   * Fetch the callers stored details (encrypted blob) plus plaintext status.
   * Auth: wallet signature over a server-issued timestamp.
   */
  @Get()
  @Response('200', 'User details')
  async getDetails(@Query() ts: string, @Query() sig: string): Promise<DetailsResponse> {
    const address = await getSigner({ message: ts, signature: sig });
    return getDetails(address);
  }

  /**
   * Store the callers details.  The blob is client-side encrypted;
   * the server stores it opaquely.  Limited by size, writes/day, and
   * account eligibility (known to broker, or funded).
   */
  @Put()
  @Response('200', 'Details stored')
  @Response('403', 'Not eligible')
  @Response('429', 'Rate limit exceeded')
  async putDetails(@Query() ts: string, @Query() sig: string, @Body() blob: EncryptedBlob): Promise<BoolResponse> {
    const address = await getSigner({ message: ts, signature: sig });
    try {
      await putDetails(address, blob);
      return { success: true };
    }
    catch (e) {
      if (e instanceof RateLimitError) {
        this.setStatus(429);
      } else {
        this.setStatus(403);
      }
      return { success: false };
    }
  }
}
