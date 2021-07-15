/**
 * We Do More Page
 */

import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';

import wwf from './images/logo-wwf.svg';
import styles from './styles.module.less';
import tree from './images/photo_tree.svg';
import smallPlant from './images/photo_smallPlant.svg';
import water from './images/photo_water.svg';
import energy from './images/photo_energy.svg';

const translations = defineMessages({
  title : {
    defaultMessage: 'We Do More',
    description: 'site.wedomore.title: Title for the We Do More page'},
  description : {
    defaultMessage: 'We do more than just offset CO2.  The projects we fund are the WWF’s gold standard, the highest global standard for maximum impact.',
    description: 'site.wedomore.description: Description for the We Do More page'},
  treeTitle : {
    defaultMessage: 'Re-forestation',
    description: 'site.wedomore.tree.title: Title for the tree photo for the We Do More page'},
  treeDescription : {
    defaultMessage: 'We help to restore the planet’s ecosystem',
    description: 'site.wedomore.tree.description: Description for the tree photo for the We Do More page'},
  smallPlantTitle : {
    defaultMessage: 'Better Farming',
    description: 'site.wedomore.smallPlant.title: Title for the smallPlant photo for the We Do More page'},
  smallPlantDescription : {
    defaultMessage: 'Prevent soil damage and erosion and improve peoples lives',
    description: 'site.wedomore.smallPlant.description: Title for the smallPlant photo for the We Do More page'},
  waterTitle : {
    defaultMessage: 'Clean Water',
    description: 'site.wedomore.water.title: Title for the water photo for the We Do More page'},
  waterDescription : {
    defaultMessage: 'Safe drinking water without boiling protects people and forests',
    description: 'site.wedomore.water.description: Title for the water photo for the We Do More page'},
  energyTitle : {
    defaultMessage: 'Clean Energy',
    description: 'site.wedomore.energy.title: Title for the energy photo for the We Do More page'},
  energyDescription : {
    defaultMessage: 'We fund clean energy projects to replace dirty coal power',
    description: 'site.wedomore.energy.description: Title for the energy photo for the We Do More page'}
});


export function WeDoMoreGreaterThanMobile() {
  return (
      <div className={styles.wrapper} id={styles.wedomore}>
        <Header as="h2" className={ `x10spaceBefore`}>
            <FormattedMessage {...translations.title} />
            <Header.Subheader className={`x5spaceBefore`}>
              <Grid centered stackable>
                <Grid.Row>
                  <Grid.Column textAlign='right' width={2}>
                    <img src={wwf} className={styles.illustration} />
                  </Grid.Column>
                  <Grid.Column textAlign='left' width={9}>
                    <FormattedMessage  {...translations.description} />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Header.Subheader>
        </Header>
          
        <Grid  columns='equal' textAlign='center' stackable>
            <Grid.Row>
              <Grid.Column textAlign='right' verticalAlign='middle'>
                <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                    <FormattedMessage {...translations.treeTitle} />
                  </Header>
                  <FormattedMessage {...translations.treeDescription} />
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
                <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                    <FormattedMessage {...translations.smallPlantTitle} />
                  </Header>
                  <FormattedMessage {...translations.smallPlantDescription}  />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column textAlign='right' verticalAlign='middle'>
                <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                    <FormattedMessage {...translations.waterTitle} />
                  </Header>
                  <FormattedMessage {...translations.waterDescription} />
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
                <Header as="h4" className={ `${styles.titlePhotos} x4spaceAfter`}>
                    <FormattedMessage {...translations.energyTitle} />
                  </Header>
                  <FormattedMessage {...translations.energyDescription} />
              </Grid.Column>
            </Grid.Row>
        </Grid>
      </div>
  );
}
