import * as React from 'react';
import { AuthRoute, AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import { ContactUs } from '../ContactUs';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { HomePage } from '../HomePage';
import { ProductList } from '../Product';

export const AppRoutes = {
  auth: {
    home: HomePage,
    contact: ContactUs,
    products: ProductList,
  },
  open: {
    gauth: GAuth,
    home: HomePage,
    contact: ContactUs,
    products: ProductList,
  },
  fallback: () => <AuthRoute component={HomePage} />
}

export const Routes = () => <AuthSwitch path="/" {...AppRoutes} />
