import { Datum, Point, PointTooltipProps} from "@nivo/line";
import { Transaction } from "@the-coin/tx-blockchain";
//import { FXRate } from "containers/FxRate/types";

export interface TxDatum extends Datum {
  y: number;
  costBasis: number;
  //fxRate: FXRate;
  txs: Transaction[],
}

type PointData = Point["data"];
interface TxPoint extends Point {
  data: PointData & TxDatum;
}
interface TooltipWidgetProps extends PointTooltipProps {
  point: TxPoint
}

export type TooltipWidget = React.FC<TooltipWidgetProps>;
