import { AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { AccountId } from '@thecointech/signers';
import { BrokerCAD } from '../BrokerCAD';
import { TheCoin } from '../TheCoinAccount';

export const AppRoutes = {
  open: {
    [AccountId.TheCoin]: TheCoin,
    [AccountId.BrokerCAD]: BrokerCAD,
  },
  fallback: NotFoundPage
}

export const Routes = () => <AuthSwitch path="/" {...AppRoutes} />
