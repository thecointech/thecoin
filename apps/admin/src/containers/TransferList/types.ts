import { ActionType } from '@thecointech/broker-db';
import { TypedActionContainer } from '@thecointech/tx-statemachine';

export type TransferRenderer<Type extends ActionType> = (transfer: TypedActionContainer<Type>) => React.ReactNode;
