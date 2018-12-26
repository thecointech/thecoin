/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import Header from 'components/Header/index';
import MainNavigation from 'containers/MainNavigation/index'
import Footer from 'components/Footer/index';
import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';

import GlobalStyle from '../../global-styles';
export default function App() {
  return (
    <React.Fragment>
      <Header />
      <MainNavigation />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
      <Footer />
    </React.Fragment>
  );
}
