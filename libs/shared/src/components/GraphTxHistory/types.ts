import { Datum, Point, PointTooltipProps} from "@nivo/line";
import { Transaction } from "@thecointech/tx-blockchain";
//import { FXRate } from "containers/FxRate/types";

export interface TxDatum extends Datum {
  y: number;  // Y is the final value,
  raw: number; // raw is the balance prior to plugins
  costBasis: number;
  //fxRate: FXRate;
  txs: Transaction[],
}

type PointData = Point["data"];
interface TxPoint extends Point {
  data: PointData & TxDatum;
}
export interface TooltipWidgetProps extends PointTooltipProps {
  point: TxPoint
}

export type TooltipWidget = React.FC<TooltipWidgetProps>;
