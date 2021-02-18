import * as React from 'react';
import styles from './styles.module.less';
import notverified from './images/verified_not_icon.svg';
import verified from './images/verified_yes_icon.svg';
import { ButtonSecondary } from '@the-coin/site-base/components/Buttons';
import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const titleVerified = { id:"app.settings.verified.titleVerified",
                defaultMessage:"Account verified",
                description:"Title for the verfified section in the setting page in the app" };
const descriptionVerified = { id:"app.settings.verified.descriptionVerified",
                defaultMessage:"Your account is verified.",
                description:"Description for the verfified section in the setting page in the app" };
const titleNotVerified = { id:"app.settings.verified.titleNotVerified",
                defaultMessage:"Account not verified",
                description:"Title for the verfified section in the setting page in the app" };
const descriptionNotVerified = { id:"app.settings.verified.descriptionNotVerified",
                defaultMessage:"Your account needs to be verified for better security.",
                description:"Description for the verfified section in the setting page in the app" };
const buttonNotVerified = { id:"app.settings.verified.button",
                defaultMessage:"Verify",
                description:"Button for the verfified section in the setting page in the app" };

type PropsVerified={
    verified: boolean;
}

export const AccountVerified = (props: PropsVerified) => {
  
    let icon = notverified;
    let title = titleNotVerified;
    let description = descriptionNotVerified;
    let button = <ButtonSecondary><FormattedMessage {...buttonNotVerified} /></ButtonSecondary>;
    if (props.verified){
        icon = verified;
        title = titleVerified;
        description = descriptionVerified;
        button = <br />;
    }
  
    return (
    <div className={styles.containerVerify}>
        <Grid stackable>
            <Grid.Row >
                <Grid.Column width={2} centered verticalAlign='middle' textAlign='center'><img src={icon} /></Grid.Column>
                <Grid.Column width={10}>
                    <Header as="h5">
                        <FormattedMessage {...title} />
                    </Header>
                    <FormattedMessage {...description} />
                </Grid.Column>
                <Grid.Column width={4} verticalAlign='middle' textAlign='center'>{button}</Grid.Column>
            </Grid.Row>
        </Grid>
      </div>
  );
}
