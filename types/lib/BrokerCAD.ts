export namespace BrokerCAD {
  export interface SignedPurchaseRequest {
    timestamp: number;
    email: string;
    cadAmount: number;
    signature: string;
  }
  export interface SignedPurchaseConfirm {
    timestamp: number;
    signature: string;
  }
  export interface SignedMessage {
    message: string;
    signature: string;
  }
  export interface SellResponse {
    orderId: string;
  }
  export interface SellRequest {
    email: string;
    txHash: string;
    blockNumber?: number;
  }
  export interface SellComplete {
    timestamp: number;
    cadAmount: number;
    coinAmount: number;
    coinRate: number;
    cadRate: number;
  }
  export interface PurchaseState {
    request?: SignedPurchaseRequest;
    confirm?: SignedPurchaseConfirm;
    complete?: PurchaseComplete;
  }
  export interface PurchaseResponse {
    orderId: string;
  }
  export interface PurchaseIds {}
  export interface PurchaseComplete {
    timestamp: number;
    cadAmount: number;
    coinAmount: number;
    coinRate: number;
    cadRate: number;
    txHash: string;
  }
  export interface NewAccountReferal {
    referrerId: string;
    newAccount: string;
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
  export interface CertifiedSale {
    transfer: CertifiedTransferRequest;
    clientEmail: string;
    signature: string;
  }
  export interface CertifiedBillPayment {
    transfer: CertifiedTransferRequest;
    payee: BillPayeePacket;
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
    name: string;
  }
}
