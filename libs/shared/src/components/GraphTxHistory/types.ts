import type { LineSvgProps, Point, PointTooltipProps} from "@nivo/line";
import type { Transaction } from "@thecointech/tx-blockchain";

export interface TxDatum {
  x: Date;
  y: number;  // Y is the final value,
  raw: number; // raw is the balance prior to plugins
  costBasis: number;
  //fxRate: FXRate;
  txs: Transaction[],
}

export type TxSeries = {
  id: string,
  data: TxDatum[]
}

export type LineProps = LineSvgProps<TxSeries>;


type PointData = Point<TxSeries>["data"];
interface TxPoint extends Point<TxSeries> {
  data: PointData & TxDatum;
}
export interface TooltipWidgetProps extends PointTooltipProps<TxSeries> {
  point: TxPoint
}

export type TooltipWidget = React.FC<TooltipWidgetProps>;
