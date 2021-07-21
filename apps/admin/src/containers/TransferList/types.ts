import { ActionType } from '@thecointech/broker-db';
import { TypedActionContainer } from '@thecointech/tx-processing/statemachine';

export type TransferRenderer<Type extends ActionType> = (transfer: TypedActionContainer<Type>) => JSX.Element;
