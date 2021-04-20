import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

export function withStore<StoreType extends {}>(initState: Partial<StoreType>) {
  // Get rid of partial decl, as typescript has trouble with the createStore otherwise
  const fixedType = initState as StoreType;
  const store = createStore(
    (store) => store ?? fixedType,
    fixedType,
   )
   return (Story: React.ElementType) => <Provider store={store}><Story /></Provider>
}
