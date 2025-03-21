import { Controller, Body, Route, Get, Put, Response, Tags, Query } from '@tsoa/runtime';
import { getAuthUrl, storeOnGoogle, listWallets, fetchWallets } from '../secure/gdrive'
import type { GoogleAuthUrl, GoogleToken, GoogleListResult, GoogleStoreAccount, GoogleGetResult } from '@thecointech/types';
import type { BoolResponse } from '../types';

@Route('secure')
@Tags('Secure')
export class SecureController extends Controller {

  /**
   * Get the authorization URL to redirect the user to
   *
   * returns GoogleAuthUrl
   **/
  @Get("google")
  @Response('200', 'Google authorization URL')
  @Response('400', 'Bad request')
  async googleAuthUrl(@Query() clientUri: string): Promise<GoogleAuthUrl> {
    const url = await getAuthUrl(clientUri);
    return { url };
  }

  /**
   * Get the listing of available accounts
   *
   * token GoogleToken
   * returns GoogleListResult
   **/
  @Put("google/list")
  @Response('200', 'Account successfully listed')
  @Response('405', 'Permission Denied')
  async googleList(@Query() clientUri: string, @Body() token: GoogleToken): Promise<GoogleListResult> {
    const wallets = await listWallets(clientUri, token);
    return { wallets };
  }

  /**
   * Store on google drive
   *
   * account GoogleUploadPacket
   * returns BoolResponse
   **/
  @Put("google/put")
  @Response('200', 'Account successfully stored')
  @Response('405', 'Permission Denied')
  async googlePut(@Query() clientUri: string, @Body() account: GoogleStoreAccount): Promise<BoolResponse> {
    const result = await storeOnGoogle(clientUri, account);
    return {
      success: result
    };
  }

  /**
   * Retrieve previously-stored file from google drive
   *
   * token GoogleToken
   * returns GoogleGetResult
   **/
  @Put("google/get")
  async googleRetrieve(@Query() clientUri: string, @Body() request: GoogleToken): Promise<GoogleGetResult> {
    const wallets = await fetchWallets(clientUri, request);
    return { wallets };
  }
}
