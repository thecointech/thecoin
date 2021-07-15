import * as React from 'react';
import styles from './styles.module.less';
import notverifiedImg from './images/verified_not_icon.svg';
import verifiedImg from './images/verified_yes_icon.svg';
import { ButtonSecondary } from '@thecointech/site-base/components/Buttons';
import { Grid, Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  titleVerified : {
      defaultMessage: 'Account verified',
      description: 'app.settings.verified.titleVerified: Title for the verfified section in the setting page in the app'},
  descriptionVerified : {
      defaultMessage: 'Your account is verified.',
      description: 'app.settings.verified.descriptionVerified: Description for the verfified section in the setting page in the app'},
  titleNotVerified : {
      defaultMessage: 'Account not verified',
      description: 'app.settings.verified.titleNotVerified: Title for the verfified section in the setting page in the app'},
  descriptionNotVerified : {
      defaultMessage: 'Your account needs to be verified for better security.',
      description: 'app.settings.verified.descriptionNotVerified: Description for the verfified section in the setting page in the app'},
  buttonNotVerified : {
      defaultMessage: 'Verify',
      description: 'app.settings.verified.buttonNotVerified: Button for the verfified section in the setting page in the app'}
});

type PropsVerified={
    verified: boolean;
}

export const AccountVerified = (props: PropsVerified) => {

    const getData = (verified: boolean) => verified
    ? { icon: verifiedImg, title: translations.titleVerified, description: translations.descriptionVerified, button: <br /> }
    : { icon: notverifiedImg, title: translations.titleNotVerified, description: translations.descriptionNotVerified, button: <ButtonSecondary><FormattedMessage {...translations.buttonNotVerified} /></ButtonSecondary>}

    const { icon, title, description, button } = getData(props.verified)

    return (
        <div className={styles.containerVerify}>
            <Grid stackable>
                <Grid.Row >
                    <Grid.Column width={2} verticalAlign='middle' textAlign='center'><img src={icon} /></Grid.Column>
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
