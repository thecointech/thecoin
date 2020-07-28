import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { FormattedHTMLMessage } from 'react-intl';

import styles from './index.module.css';

export const Stickers = () => {
  return (
    <React.Fragment>
        <Grid stackable columns={2}>
            <Grid.Row columns={3}>
                <Grid.Column className={styles.card}>
                <h4>
                    <FormattedHTMLMessage id="site.homepage.landscape.stickers.titleleft"
                      defaultMessage="You’re Wealthier"
                      description="Title for left sticker"
                      values={{ what: 'react-intl' }}/>
                </h4>
                <p>
                    <FormattedHTMLMessage id="site.homepage.landscape.stickers.descriptionleft"
                      defaultMessage="Your money is always earning.<br />Make it earn for you."
                      description="Description for left sticker"
                      values={{ what: 'react-intl' }}/>
                </p>
                <a href="">Learn More</a>
                </Grid.Column>
                <Grid.Column className={styles.card}>
                    <h4>
                        <FormattedHTMLMessage id="site.homepage.landscape.stickers.titleright"
                        defaultMessage="Earth’s Healthier"
                        description="Title for right sticker"
                        values={{ what: 'react-intl' }}/>
                    </h4>
                    <p>

                        <FormattedHTMLMessage id="site.homepage.landscape.stickers.descriptionleft"
                        defaultMessage="Be part of the solution.<br />We offset our clients’ CO2."
                        description="Description for left sticker"
                        values={{ what: 'react-intl' }}/>
                    </p>
                    <a href="">Learn More</a>
                </Grid.Column>
            </Grid.Row>
        </Grid>
        </React.Fragment>
    );
}