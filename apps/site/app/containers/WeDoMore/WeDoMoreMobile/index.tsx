/**
 * We Do More Page
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';

import wwf from './images/logo-wwf.svg';
import styles from './styles.module.css';
import tree from './images/photo_tree.svg';
import smallPlant from './images/photo_smallPlant.svg';
import water from './images/photo_water.svg';
import energy from './images/photo_energy.svg';


const title = { id:"site.wedomore.title", 
                defaultMessage:"We Do More",
                description:"Title for the We Do More page"};
const description = { id:"site.wedomore.description", 
                      defaultMessage:"We do more than just offset CO2.  The projects we fund are the WWF’s gold standard, the highest global standard for maximum impact.",
                      description:"Title for the We Do More page"};

const treeTitle = { id:"site.wedomore.tree.title", 
                    defaultMessage:"Re-forestation",
                    description:"Title for the tree photo for the We Do More page"};
const treeDescription = {  id:"site.wedomore.tree.description", 
                            defaultMessage:"We help to restore the planet’s ecosystem",
                            description:"Title for the tree photo for the We Do More page"};

const smallPlantTitle = { id:"site.wedomore.smallPlant.title", 
                          defaultMessage:"Better Farming",
                          description:"Title for the smallPlant photo for the We Do More page"};
const smallPlantDescription = {  id:"site.wedomore.smallPlant.description", 
                                defaultMessage:"Prevent soil damage and erosion and improve peoples lives",
                                description:"Title for the smallPlant photo for the We Do More page"};

const waterTitle = { id:"site.wedomore.water.title", 
                    defaultMessage:"Clean Water",
                    description:"Title for the water photo for the We Do More page"};
const waterDescription = {  id:"site.wedomore.water.description", 
                            defaultMessage:"Safe drinking water without boiling protects people and forests",
                            description:"Title for the water photo for the We Do More page"};

const energyTitle = { id:"site.wedomore.energy.title", 
                    defaultMessage:"Clean Energy",
                    description:"Title for the energy photo for the We Do More page"};
const energyDescription = {  id:"site.wedomore.energy.description", 
                            defaultMessage:"We fund clean energy projects to replace dirty coal power",
                            description:"Title for the energy photo for the We Do More page"};

export function WeDoMoreMobile() {
  return (
    <div className={styles.wrapper} id={styles.wedomore}>
      <Grid className={ `x4spaceBefore`} columns='equal' textAlign='center'>
        <Grid.Row>
          <Grid.Column>
              <Header as="h2">
                  <FormattedMessage {...title}/>
              </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column textAlign='right' width={3}>
                <img src={wwf} className={styles.bear} />
            </Grid.Column>
            <Grid.Column textAlign='left'  width={9}>
              <FormattedMessage {...description} />
            </Grid.Column>
          </Grid.Row>
      </Grid>
      <Grid className={styles.content} columns='equal' textAlign='center' stackable>
          <Grid.Row>
            <Grid.Column textAlign='left' verticalAlign='middle'>
              <img src={tree} className={styles.morephotos} />
            </Grid.Column>
            <Grid.Column textAlign='left' verticalAlign='middle'>
              <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                  <FormattedMessage {...treeTitle} />
                </Header>
                <FormattedMessage {...treeDescription} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column textAlign='right'>
              <img src={smallPlant} className={styles.morephotos} />
            </Grid.Column>
            <Grid.Column textAlign='right' verticalAlign='middle'>
              <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                  <FormattedMessage {...smallPlantTitle} />
                </Header>
                <FormattedMessage {...smallPlantDescription} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column textAlign='left' verticalAlign='middle'>
              <img src={water} className={styles.morephotos} />
            </Grid.Column>
            <Grid.Column textAlign='left'>
              <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                  <FormattedMessage {...waterTitle} />
                </Header>
                <FormattedMessage {...waterDescription} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column textAlign='right'>
              <img src={energy} className={styles.morephotos} />
            </Grid.Column>
            <Grid.Column textAlign='right' verticalAlign='middle'>
              <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                  <FormattedMessage {...energyTitle} />
                </Header>
                <FormattedMessage {...energyDescription} />
            </Grid.Column>
          </Grid.Row>
      </Grid>
    </div>
  );
}
