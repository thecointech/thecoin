import { Datum} from "@nivo/line";
import { Transaction } from "@the-coin/tx-blockchain";
//import { FXRate } from "containers/FxRate/types";

export interface TxDatum extends Datum {
  costBasis: number;
  //fxRate: FXRate;
  txs: Transaction[],
}
