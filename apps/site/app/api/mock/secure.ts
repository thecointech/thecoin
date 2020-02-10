import { GoogleAuthUrl, GoogleToken, GoogleListResult, GoogleStoreAccount, GoogleGetResult, GoogleWalletItem } from "@the-coin/types";
import { buildResponse, delay } from "./network";
import testWallet from './testAccount.json';

let wallets = [
  {
    id: "123",
    name: "TestAccNoT First",
    type: "Type?",
    wallet: JSON.stringify(testWallet),
  },
  {
    id: "345",
    name: "TestAccNoT Another",
    type: "Type?",
    wallet: JSON.stringify(testWallet),
  }
];

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
export class MockSecureApi {
  /**
   *
   * @summary Get the authorization URL to redirect the user to
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecureApi
   */
  async googleAuthUrl(_options?: any)
  {
    await delay(2500);

    return buildResponse<GoogleAuthUrl>({
      url: `${window.location.origin}/#/accounts/gauth?code=${MockedCode}`
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
  async googleList(token: GoogleToken, _options?: any) {
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
  async googlePut(uploadPacket: GoogleStoreAccount, _options?: any) {
    checkCode(uploadPacket.token);

    await delay(2500);
    wallets.push({
      id: wallets.length.toString(),
      name: uploadPacket.walletName,
      type: "not sure",
      wallet: uploadPacket.wallet,
    })
    return buildResponse<boolean>(true);
  }
  /**
   *
   * @summary Retrieve previously-stored file from google drive
   * @param {GoogleToken} token
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecureApi
   */
  async googleRetrieve(token: GoogleToken, _options?: any) {
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