import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.less';

export type Props = {
    Mobile: boolean;
}

const titleLeft = { id:"site.homepage.landscape.stickers.left.title", 
                    defaultMessage:"You’re Wealthier",
                    description:"The title for the homepage landscape left sticker"};
const descriptionLeft = {   id:"site.homepage.landscape.stickers.left.description", 
                            defaultMessage:"Your money is always earning. Make it earn for you.",
                            description:"Description for sticker for the homepage landscape left sticker"};
const linkLeft = {  id:"site.homepage.landscape.stickers.left.link", 
                    defaultMessage:"Learn More",
                    description:"Link name for sticker for the homepage landscape left sticker"};

const titleRight = { id:"site.homepage.landscape.stickers.right.title", 
                    defaultMessage:"Earth’s Healthier",
                    description:"The title for the homepage landscape right sticker"};
const descriptionRight = {   id:"site.homepage.landscape.stickers.right.description", 
                            defaultMessage:"Be part of the solution. We offset our clients’ CO2.",
                            description:"Description for sticker for the homepage landscape right sticker"};
const linkRight = {  id:"site.homepage.landscape.stickers.right.link", 
                    defaultMessage:"Learn More",
                    description:"Link name for sticker for the homepage landscape right sticker"};


export const Stickers = (props: Props) => {

    let classForSticker = styles.cardContainer;
    if (props.Mobile === true) {
        classForSticker = styles.cardContainerMobile;
    }

  return (
        <Grid stackable columns={2} id={styles.stickers} className={classForSticker}>
            <Grid.Row columns={3}>
                <Grid.Column className={ `${styles.card} x6spaceLeft` }>
                <Header as='h4'>
                    <FormattedMessage {...titleLeft} />
                </Header>
                <p>
                    <FormattedMessage {...descriptionLeft} />
                </p>
                <a href=""><FormattedMessage {...linkLeft} /></a>
                </Grid.Column>
                <Grid.Column className={ `${styles.card} x6spaceLeft` }>
                    <Header as='h4'>
                        <FormattedMessage {...titleRight} />
                    </Header>
                    <p>
                        <FormattedMessage {...descriptionRight} />
                    </p>
                    <a href=""><FormattedMessage {...linkRight} /></a>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
