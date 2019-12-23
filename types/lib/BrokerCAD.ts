export namespace BrokerCAD {
  export interface SubscriptionDetails {
    id?: string;
    email?: string;
    confirmed?: boolean;
    firstName?: string;
    lastName?: string;
    country?: string;
    city?: string;
  }
  export interface SignedMessage {
    message: string;
    signature: string;
  }
  export interface NewAccountReferal {
    referrerId: string;
    newAccount: string;
  }
  export interface GoogleWalletItem {
    id: GoogleFileIdent;
    wallet?: string;
  }
  export interface GoogleToken {
    token: string;
  }
  export interface GooglePutRequest {
    token: GoogleToken;
    wallet: string;
    walletName: string;
  }
  export interface GoogleListResult {
    wallets: GoogleFileIdent[];
  }
  export interface GoogleGetResult {
    wallets: GoogleWalletItem[];
  }
  export interface GoogleFileIdent {
    id: string;
    name?: string;
    type?: string;
  }
  export interface GoogleAuthUrl {
    url: string;
  }
  export interface ETransferPacket {
    email: string;
    question: string;
    answer: string;
    message?: string;
  }
  export interface eTransferCodeResponse {
    code?: string;
    error?: string;
  }
  export interface EncryptedPacket {
    encryptedPacket: string;
    version: string;
  }
  export interface CertifiedTransferResponse {
    message: string;
    txHash: string;
  }
  export interface CertifiedTransferRequest {
    from: string;
    to: string;
    value: number;
    fee: number;
    timestamp: number;
    signature: string;
  }
  export interface CertifiedTransfer {
    transfer: CertifiedTransferRequest;
    instructionPacket: EncryptedPacket;
    signature: string;
  }
  export interface BrokerStatus {
    address: string;
    certifiedFee: number;
  }
  export interface BoolResponse {
    success?: boolean;
  }
  export interface BillPayeePacket {
    payee?: string;
    accountNumber?: string;
  }
}
