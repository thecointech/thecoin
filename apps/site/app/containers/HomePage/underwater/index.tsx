import * as React from 'react';

import styles from './index.module.css';
import illustration from './images/5_illustration.svg';
import background from './images/full_background.svg';
import co2 from './images/icon_5_1.svg';
import science from './images/icon_5_2.svg';
import trees from './images/icon_5_3.svg';

import { Grid } from 'semantic-ui-react';

export const Underwater = () => {

  return (
    <React.Fragment>
      <img className={styles.illustration} src={illustration} />
      <div className={styles.landscape}>
      <Grid centered textAlign='center'>
          <Grid.Row centered textAlign='center'>
            <Grid.Column>
              <h2>Earths’ Healthier</h2>
              <p>You can become CO2-neutral with TheCoin as we work to offset our clients’ emissions.</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid className={styles.content}>
          <Grid.Row columns={3}>
            <Grid.Column columns={3}>
                <img src={co2} />
                <h4>Make a Difference</h4>
                <p>Offsetting CO2 is effective.  Extremely effective!</p>
                <a href="">Compare Outcomes</a>
            </Grid.Column>
            
            <Grid.Column columns={3} >
                <img src={science} />
                <h4>Scientifically Verified</h4>
                <p>Prove it?  We’d love to!</p>
                <a href="">Why We Can Be So Confident</a>
            </Grid.Column>

            <Grid.Column columns={3} >
                <img src={trees} />
                <h4>We Do More</h4>
                <p>It’s not just CO2.  The projects we fund are vital to restoring our ecosystem.</p>
                <a href="">What We Do</a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        
        <img className={styles.water} src={background} />
      </div>
    </React.Fragment>
  );
}

