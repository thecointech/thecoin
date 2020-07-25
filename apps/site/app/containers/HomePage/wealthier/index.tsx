import * as React from 'react';
import { Grid } from 'semantic-ui-react';

import coffeePerson from './images/3_illustration.svg';
import startnow from './images/icon3_01.svg';
import investment from './images/icon3_02.svg';
import growth from './images/icon3_03.svg';
import profits from './images/icon3_04.svg';


export const Wealthier = () => {

  return (
    <React.Fragment>
      <Grid>
        <Grid.Row columns={3}>
          <Grid.Column>
              <h2>You’re Wealthier</h2>
              <p>Enjoy the benefits of investment growth on every dollar with our online spending account.</p>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={startnow} />
              <h4>Start Now</h4>
              <p>The most important ingredient is time. You’re young - maximize your benefit!</p>
              <a href="">Learn Your Edge</a>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={investment} />
              <h4>The Best Investment</h4>
              <p>Why settle?  Our time-tested strategy has the best long-term results.</p>
              <a href="">Compare Us</a>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3}>

          <Grid.Column columns={3}>
            <img src={coffeePerson} />
          </Grid.Column>
          
          <Grid.Column columns={3} >
              <img src={growth} />
              <h4>Maximum Growth</h4>
              <p>Add $250000 to your retirement - with no money down.</p>
              <a href="">How Anyone Can Get Rich Slow</a>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={profits} />
              <h4>Keep Your Profits</h4>
              <p>Every dollar earns every day.  As a non-profit, we want you to keep that benefit.</p>
              <a href="">Who Wins?</a>
          </Grid.Column>
        </Grid.Row>
      </Grid>

    </React.Fragment>
  );
}

