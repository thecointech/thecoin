
export type XferRequest = {
  wallet: string; // absolute path to wallet file
  date: string; // SQL Date (YYYY-MM-DD)
  transfers: {
    to: string; // recipient address
    fiat: number; // $123.45
  }[]
}
