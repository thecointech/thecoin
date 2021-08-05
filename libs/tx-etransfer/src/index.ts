import { StateMachineProcessor } from "@thecointech/tx-statemachine";
import { graph } from "./graph";
import type { TheCoin } from '@thecointech/contract';
import type { RbcApi } from '@thecointech/rbcapi';

export const Processor = (contract: TheCoin, bank: RbcApi|null = null) => new StateMachineProcessor(graph, contract, bank);

