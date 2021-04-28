import * as React from 'react';
import illustration from './images/icon_contact_big.svg';
import {AppContainerWithShadow} from 'components/AppContainers';

import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ContactForm } from './Form';
import { useState } from 'react';
import { ContactAvatar, TheCoinAvatar } from './Avatars';
import { UserMessage, Answer } from './Messages';

import styles from './styles.module.less';

const title = { id:"app.contactus.title",
                defaultMessage:"Contact Us",
                description:"Main title for the Contact Us page in the app" };
const description = { id:"app.contactus.description",
                      defaultMessage:"Send us a secured message and we will answer as quickly as we can",
                      description:"Description for the Contact Us page in the app" };
const titleMessages = { id:"app.contactus.titleSection",
                defaultMessage:"Messages",
                description:"Main title for the Contact Us page, message section in the app" };

const errorMessage = { id:"app.contactus.errorMessage",
                defaultMessage:"We have encountered an error. Don't worry, your message is safe, but please still contact support@thecoin.io",
                description:"Error Message for the contact us page" };
const successMessage = { id:"app.contactus.successMessage",
                defaultMessage:"Message received.\nYou should receive an answer in 1-2 business days.",
                description:"Success Message for the contact us page" };
const messageLabel = { id:"app.contactus.form.email",
                defaultMessage:"Recipient email",
                description:"Label for the form the contact us page" };
const messageDesc = { id:"app.contactus.form.emailDesc",
                defaultMessage:"An email address to send the e-Transfer to",
                description:"Label for the form the contact us page" };

const button = { id:"app.contactus.form.button",
                defaultMessage:"Send",
                description:"For the button in the contact us page" };


export const ContactUs = () => {
  const [message, setMessage] = useState('');
  const [successHidden, setSuccessHidden] = useState(true);
  const [errorHidden] = useState(true);
  
  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => { 
    if (e) e.preventDefault();
    console.log(message);
    setMessage("");
    setSuccessHidden(false);
  }
  const intl = useIntl();

  return (
    <React.Fragment>
      <Grid className={ `x2spaceBefore x4spaceAfter` } >
        <Grid.Row>
          <Grid.Column width={2}>
            <img src={illustration} />
          </Grid.Column>
          <Grid.Column width={13}>
            <Header as="h5" className={ `appTitles` }>
                <FormattedMessage {...title} />
                <Header.Subheader>
                  <FormattedMessage  {...description} />
                </Header.Subheader>
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <AppContainerWithShadow>
        <Header as="h5" className={ `appTitles` }>
            <FormattedMessage {...titleMessages} />
        </Header>
        <div className={styles.messagesContainer}>
          <div>
            <div className={styles.contactFormLine}>
              <ContactForm
                errorMessage={errorMessage}
                errorHidden={errorHidden}
                successMessage={successMessage}
                successHidden={successHidden}

                messageLabel={messageLabel}
                setMessage={(event: React.FormEvent<HTMLInputElement>) => setMessage(event.currentTarget.value)}
                messageDes={intl.formatMessage(messageDesc)}

                button={button}
                onSubmit={onSubmit}
              />
              </div>
              <div className={styles.contactAvatarLine}>
                <ContactAvatar />
              </div>
          </div>


          <div>
            <div className={styles.contactAnswerLine}>
              <div className={ `${styles.contactAvatarLine} ${styles.answer}` }>
                <TheCoinAvatar />
              </div>
              <div className={styles.messageZone}>
                  TEST
                <div>you - 2 days ago</div>
              </div>
            </div>
          </div>

          <div>
            <div className={ `${styles.contactMessageLine} x6spaceBefore` }>
              <div>
                TEST
              <div>you - 2 days ago</div>
              </div>
              </div>
              <div className={styles.contactAvatarLine}>
                <ContactAvatar />
              </div>
          </div>

          <div>
            <div className={styles.contactAnswerLine}>
              <div className={ `${styles.contactAvatarLine} x6spaceAfter ${styles.answer}` }>
                <TheCoinAvatar />
              </div>
              <div className={styles.messageZone}>
                  TEST
                <div className={styles.infosRight}>you - 2 days ago</div>
              </div>
            </div>
          </div>

          <UserMessage />

          <div>
            <div className={styles.contactAnswerLine}>
              <div className={ `${styles.contactAvatarLine} x6spaceAfter ${styles.answer}` }>
                <TheCoinAvatar />
              </div>
              <div className={styles.messageZone}>
                  TEST
                <div className={styles.infosRight}>you - 2 days ago</div>
              </div>
            </div>
          </div>
          <div>
            <div className={styles.contactAnswerLine}>
              <div className={ `${styles.contactAvatarLine} x6spaceAfter x6spaceBefore ${styles.answer}` }>
                <TheCoinAvatar />
              </div>
              <div className={styles.messageZone}>
                  TEST
                <div>you - 2 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </AppContainerWithShadow>
    </React.Fragment>
  );
}

