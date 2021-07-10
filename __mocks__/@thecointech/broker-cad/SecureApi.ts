import { SecureApi as SrcApi, GoogleAuthUrl, GoogleToken, GoogleListResult, GoogleStoreAccount, GoogleGetResult, GoogleWalletItem } from "@thecointech/broker-cad";
import { buildResponse, delay } from "../axios-utils";
import { wallets } from '../account/store';

const MockedCode = "MockedCode";
const checkCode = ({token}: GoogleToken) => {
  if (MockedCode !== token) {
    throw new Error("Invalid Code");
  }
}
/**
 * SecureApi - object-oriented interface
 * @export
 * @class SecureApi
 * @extends {BaseAPI}
 */
export class SecureApi  implements Pick<SrcApi, keyof SrcApi> {
  /**
   *
   * @summary Get the authorization URL to redirect the user to
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecureApi
   */
  async googleAuthUrl(_clientUri: string, _options?: any)
  {
    await delay(1500);

    return buildResponse<GoogleAuthUrl>({
      url: `${window.location.origin}/#/gauth?code=${MockedCode}`
    });
  }
  /**
   *
   * @summary Get the listing of available accounts
   * @param {GoogleToken} token
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecureApi
   */
  async googleList(_clientUri: string, token: GoogleToken, _options?: any) {
    checkCode(token);
    await delay(250);
    return buildResponse<GoogleListResult>({
      wallets
    });
  }
  /**
   *
   * @summary Store on google drive
   * @param {GoogleStoreAccount} uploadPacket
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecureApi
   */
  async googlePut(_clientUri: string, uploadPacket: GoogleStoreAccount, _options?: any) {
    checkCode(uploadPacket.token);

    await delay(2500);
    wallets.push({
      id: wallets.length.toString(),
      name: uploadPacket.walletName,
      type: "not sure",
      wallet: uploadPacket.wallet,
    })
    return buildResponse({success: true});
  }
  /**
   *
   * @summary Retrieve previously-stored file from google drive
   * @param {GoogleToken} token
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecureApi
   */
  async googleRetrieve(_clientUri: string, token: GoogleToken, _options?: any) {
    checkCode(token);
    await delay(250);
    const results: GoogleWalletItem[] = wallets.map((w) => ({
      wallet: w.wallet,
      id: {
        id: w.id,
        name: w.name,
        type: w.type,
      }
    }))
    return buildResponse<GoogleGetResult>({
      wallets: results
    })
  }
}
