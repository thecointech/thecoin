/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';

import Header from 'components/Header/index';
import MainNavigation from 'containers/MainNavigation/index';
import Footer from 'components/Footer/index';
import MainPageContent from 'containers/MainPageContent/index';

import { Container } from 'semantic-ui-react';
import GlobalStyle from '../../global-styles';
import PageSidebar from 'containers/PageSidebar';

export default function App() {
  return (
    <React.Fragment>
      <Header />
      <MainNavigation />
      <Container>
        <PageSidebar>
        <MainPageContent />
        </PageSidebar>
      </Container>
      <GlobalStyle />
      <Footer />
    </React.Fragment>
  );
}
