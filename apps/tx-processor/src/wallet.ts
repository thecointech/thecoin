import encrypted from './account.json'
import secret from './account-secret.json';
import { Wallet } from "ethers";

export const GetWallet = () => Wallet.fromEncryptedJson(JSON.stringify(encrypted), secret.key, () => {});
