import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.less';

export type Props = {
    Mobile: boolean;
}

export const Stickers = (props: Props) => {

    let classForSticker = styles.cardContainer;
    if (props.Mobile === true) {
        classForSticker = styles.cardContainerMobile;
    }

  return (
        <Grid stackable columns={2} id={styles.stickers} className={classForSticker}>
            <Grid.Row columns={3}>
                <Grid.Column className={styles.card}>
                <Header as='h4'>
                    <FormattedMessage id="site.homepage.landscape.stickers.left.title"
                      defaultMessage="You’re Wealthier"
                      description="Title for left sticker"
                    />
                </Header>
                <p>
                    <FormattedMessage id="site.homepage.landscape.stickers.left.description"
                      defaultMessage="Your money is always earning. Make it earn for you."
                      description="Description for left sticker"
                    />
                </p>
                <a href="">
                    <FormattedMessage id="site.homepage.landscape.stickers.left.link"
                        defaultMessage="Learn More"
                        description="Link name for left sticker"
                    /></a>
                </Grid.Column>
                <Grid.Column className={styles.card}>
                    <Header as='h4'>
                        <FormattedMessage id="site.homepage.landscape.stickers.right.title"
                            defaultMessage="Earth’s Healthier"
                            description="Title for right sticker"
                        />
                    </Header>
                    <p>
                        <FormattedMessage id="site.homepage.landscape.stickers.right.description"
                            defaultMessage="Be part of the solution. We offset our clients’ CO2."
                            description="Description for left sticker"
                        />
                    </p>
                    <a href="">
                        <FormattedMessage id="site.homepage.landscape.stickers.right.link"
                            defaultMessage="Learn More"
                            description="Link name for right sticker"
                        /></a>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
