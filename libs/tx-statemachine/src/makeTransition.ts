import { ActionType } from '@thecointech/broker-db/transaction/types';
import { NamedTransition, TransitionCallback } from './types';

export function makeTransition<Type extends ActionType=ActionType>(name: string, action: TransitionCallback<Type>) : NamedTransition<Type> {
  Object.defineProperty(action, 'transitionName', { value: name, writable: false });
  return action as NamedTransition<Type>;
}
