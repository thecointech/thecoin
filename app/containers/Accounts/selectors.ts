// /**
//  * Homepage selectors
//  */

// import { createSelector, createStructuredSelector } from 'reselect';
// import { ApplicationRootState } from 'types';
// import { ContainerState } from './types';

// const selectWallets = (state: ApplicationRootState) =>  state.wallets;

// const makeSelectAllWallets = () =>
//   createSelector(selectWallets, substate => substate.wallets);

// // Map RootState to your StateProps
// const mapStateToProps = createStructuredSelector<ApplicationRootState, ContainerState>({
//   // All the keys and values are type-safe
//   wallets: makeSelectAllWallets()
// });

// export { selectWallets, ContainerState, mapStateToProps };