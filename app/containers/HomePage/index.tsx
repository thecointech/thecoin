/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import * as React from 'react';
import { Grid, Container } from 'semantic-ui-react';
import IconWithText from 'components/IconWithText/index';
import * as Icons from 'utils/icons';
import messages from './messages';
import ButtonLink from 'components/ButtonLink/index'

export default class HomePage extends React.PureComponent {
  public render() {
    return (
      <React.Fragment>
        <Grid columns={3} stackable divided centered>
          <Grid.Row>
            <Grid.Column>
              <IconWithText
                icon={Icons.ChartLine}
                message={messages.blurbGrow}
              />
            </Grid.Column>
            <Grid.Column>
              <IconWithText
                icon={Icons.ShoppingBasket}
                message={messages.blurbSpend}
              />
            </Grid.Column>
            <Grid.Column>
              <IconWithText icon={Icons.Lock} message={messages.blurbFees} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Container textAlign="center">
          <ButtonLink
            to="/howItWorks"
            size="massive"
          >
            LEARN MORE
          </ButtonLink>
          <br />
          <ButtonLink
            size="massive"
            to="/accounts"
          >
            GO TO ACCOUNTS
          </ButtonLink>
        </Container>
      </React.Fragment>
    );
  }
}
