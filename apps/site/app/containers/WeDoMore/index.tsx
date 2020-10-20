/**
 * We Do More Page
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header, Segment } from 'semantic-ui-react';
import { WeDoMoreMobile } from 'containers/WeDoMoreMobile';
import { CreateAccountBanner } from 'containers/CreateAccountBanner';

import wwf from './images/logo-wwf.svg';
import styles from './styles.module.css';
import tree from './images/photo_tree.svg';
import smallPlant from './images/photo_smallPlant.svg';
import water from './images/photo_water.svg';
import energy from './images/photo_energy.svg';
import { Media } from 'containers/ResponsiveTool'; 

export function WeDoMore() {
  return (
      <>
      <Segment as={Media} greaterThan="mobile">
          <div className={styles.wrapper} id={styles.wedomore}>
              <Grid className={styles.content} columns='equal' textAlign='center' stackable>
                <Grid.Row>
                  <Grid.Column>
                      <Header as="h2">
                          <FormattedMessage 
                                id="site.wedomore.title" 
                                defaultMessage="We Do More"
                                description="Main title for the We Do More page" />
                      </Header>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column textAlign='right'>
                        <img src={wwf} className={styles.illustration} />
                    </Grid.Column>
                    <Grid.Column textAlign='left'>
                      <FormattedMessage 
                            id="site.wedomore.description" 
                            defaultMessage="We do more than just offset CO2.  The projects we fund 
                            are the WWF’s gold standard, the highest global standard 
                            for maximum impact."
                            description="Description underneath title for the We Do More page" />
                    </Grid.Column>
                    <Grid.Column></Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column textAlign='right' verticalAlign='middle'>
                      <Header as="h4" className={styles.titlePhotos}>
                          <FormattedMessage 
                            id="site.wedomore.tree.title" 
                            defaultMessage="Re-forestation"
                            description="Title for the tree photo for the We Do More page" />
                        </Header>
                        <FormattedMessage 
                            id="site.wedomore.tree.description" 
                            defaultMessage="We help to restore the planet’s ecosystem"
                            description="Description for the tree photo for the We Do More page"  />
                    </Grid.Column>
                    <Grid.Column textAlign='left' verticalAlign='middle'>
                      <img src={tree} className={styles.morephotos} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column textAlign='right'>
                      <img src={smallPlant} className={styles.morephotos} />
                    </Grid.Column>
                    <Grid.Column textAlign='left' verticalAlign='middle'>
                      <Header as="h4" className={styles.titlePhotos}>
                          <FormattedMessage 
                            id="site.wedomore.smallPlant.title" 
                            defaultMessage="Better Farming"
                            description="Title for the smallPlant photo for the We Do More page" />
                        </Header>
                        <FormattedMessage 
                            id="site.wedomore.smallPlant.description" 
                            defaultMessage="Prevent soil damage and erosion and improve peoples lives"
                            description="Description for the smallPlant photo for the We Do More page"  />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column textAlign='right' verticalAlign='middle'>
                      <Header as="h4" className={styles.titlePhotos}>
                          <FormattedMessage 
                            id="site.wedomore.water.title" 
                            defaultMessage="Clean Water"
                            description="Title for the water photo for the We Do More page" />
                        </Header>
                        <FormattedMessage 
                            id="site.wedomore.water.description" 
                            defaultMessage="Safe drinking water without boiling protects people and forests"
                            description="Description for the water photo for the We Do More page"  />
                    </Grid.Column>
                    <Grid.Column textAlign='left'>
                      <img src={water} className={styles.morephotos} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column textAlign='right'>
                      <img src={energy} className={styles.morephotos} />
                    </Grid.Column>
                    <Grid.Column textAlign='left' verticalAlign='middle'>
                      <Header as="h4" className={styles.titlePhotos}>
                          <FormattedMessage 
                            id="site.wedomore.energy.title" 
                            defaultMessage="Clean Energy"
                            description="Title for the energy photo for the We Do More page" />
                        </Header>
                        <FormattedMessage 
                            id="site.wedomore.energy.description" 
                            defaultMessage="We fund clean energy projects  to replace dirty coal power"
                            description="Description for the energy photo for the We Do More page"  />
                    </Grid.Column>
                  </Grid.Row>
              </Grid>
          </div>
      </Segment>
      <Segment as={Media} at="mobile">
        <WeDoMoreMobile />
      </Segment>
      <CreateAccountBanner />
    </>
  );
}
