// @flow
export type PurchaseOrder = { email: string, cadAmount: number };
export type SignedPurchaseOrder = { order: string, signature: string };
export type PurchaseResponse = { orderId: string };
export type SellOrder = { email: string, txHash: string, blockNumber: number };
export type SignedSellOrder = { order: string, signature: string };
export type SellResponse = { orderId: string };
