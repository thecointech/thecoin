import { SecureApi, GoogleAuthUrl, GoogleToken, GoogleListResult, GoogleStoreAccount, GoogleGetResult, GoogleWalletItem } from "@thecointech/broker-cad";
import { buildResponse, delay } from "@thecointech/site-base/api/mock/utils";
import { wallets } from './accounts';

const MockedCode = "MockedCode";
const checkCode = ({token}: GoogleToken) => {
  if (MockedCode !== token) {
    throw new Error("Invalid Code");
  }
}

export class MockSecureApi  implements Pick<SecureApi, keyof SecureApi> {

  async googleAuthUrl(_options?: any)
  {
    await delay(2500);

    return buildResponse<GoogleAuthUrl>({
      url: `${window.location.origin}/#/gauth?code=${MockedCode}`
    });
  }

  async googleList(token: GoogleToken, _options?: any) {
    checkCode(token);
    await delay(250);
    return buildResponse<GoogleListResult>({
      wallets
    });
  }

  async googlePut(uploadPacket: GoogleStoreAccount, _options?: any) {
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
