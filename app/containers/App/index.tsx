/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';

import Header from 'components/Header';
import MainNavigation from 'containers/MainNavigation';
import Footer from 'components/Footer';
import MainPageContent from 'containers/MainPageContent';

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
