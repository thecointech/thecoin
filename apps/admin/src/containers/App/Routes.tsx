import * as React from 'react';
import { AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { TheCoinRoutes } from '../TheCoinAccount/Routes';
import { AccountId } from '@thecointech/signers';
import { BrokerCADRoutes } from '../BrokerCAD/Routes';

export const AppRoutes = {
  [AccountId.TheCoin]: TheCoinRoutes,
  [AccountId.BrokerCAD]: BrokerCADRoutes,
  fallback: NotFoundPage
}

export const Routes = () => <AuthSwitch path="/" {...AppRoutes} />
