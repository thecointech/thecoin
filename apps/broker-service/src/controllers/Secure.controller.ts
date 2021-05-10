import { GoogleAuthUrl, GoogleToken, GoogleListResult, GoogleStoreAccount, GoogleGetResult } from '@thecointech/types';
import { Controller, Body, Route, Get, Put, Response, Tags } from '@tsoa/runtime';
import { getAuthUrl, storeOnGoogle, listWallets, fetchWallets } from '../secure/gdrive'
import { BoolResponse } from '../types';



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
    async googleAuthUrl() : Promise<GoogleAuthUrl> {
        try {
            const url = getAuthUrl();
            return {url};
        }
        catch (err) {
            console.error(err);
            throw new Error("Server Error")
        }
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
    async googleList(@Body() token: GoogleToken): Promise<GoogleListResult> {
      try {
        const wallets = await listWallets(token);
        return {wallets};
      }
      catch (err) {
        console.error(err);
        throw new Error("Server Error")
      }
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
    async googlePut(@Body() account: GoogleStoreAccount): Promise<BoolResponse> {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await storeOnGoogle(account);
          resolve({
            success: result
          });
        }
        catch (err) {
          console.error(err);
          reject("Server Error");
        }
      })
    }

    /**
     * Retrieve previously-stored file from google drive
     *
     * token GoogleToken
     * returns GoogleGetResult
     **/
    @Put("google/get")
    async googleRetrieve(@Body() request: GoogleToken) : Promise<GoogleGetResult> {
      try {
        const wallets = await fetchWallets(request);
        return {wallets};
      }
      catch (err) {
        console.error(err);
        throw new Error("Server Error")
      }
    }
}
