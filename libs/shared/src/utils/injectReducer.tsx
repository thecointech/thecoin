import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { InjectReducerParams } from '../types';
import { getInjectors } from './reducerInjectors';
import { ReactReduxContext } from 'react-redux'
/**
 * Dynamically injects a reducer
 *
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 *
 */

export default function hocWithReducer<P>({
  key,
  reducer
}: InjectReducerParams) {
  function wrap(
    WrappedComponent: React.ComponentType<P>,
  ): React.ComponentType<P> {
    // dont wanna give access to HOC. Child only
    class ReducerInjector extends React.Component<P> {
      public static WrappedComponent = WrappedComponent;
      public static contextType = ReactReduxContext;
      public static displayName = `withReducer(${WrappedComponent.displayName ||
        WrappedComponent.name ||
        'Component'})`;

      public injectors = getInjectors(this.context.store);

      public componentWillMount() {
        const { injectReducer } = this.injectors;
        injectReducer(key, reducer);
      }

      public render() {
        return <WrappedComponent {...this.props} />;
      }
    }

    // @ts-ignore
    return hoistNonReactStatics(ReducerInjector, WrappedComponent) as any;
  }
  return wrap;
}
