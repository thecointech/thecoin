import * as React from 'react';
import illustration from './images/icon_contact_big.svg';
import {AppContainerWithShadow} from 'components/AppContainers';
import { AvailableSoon } from "@thecointech/shared/containers/Widgets/AvailableSoon";
import coin from './images/thecoin_icon.svg';
import { ContactForm } from './ContactForm';
import { useState } from 'react';
import { Answer } from './Messages';
import { PageHeader } from '../../components/PageHeader';
import styles from './styles.module.less';
import { defineMessages } from 'react-intl';

const translations = defineMessages({
  title : {
      defaultMessage: 'Contact Us',
      description: 'app.contactus.title: Main title for the Contact Us page in the app'},
  description : {
      defaultMessage: 'Send us a secured message and we will answer as quickly as we can',
      description: 'app.contactus.description: Description for the Contact Us page in the app'},
  errorMessage : {
      defaultMessage: 'We have encountered an error. Don\'t worry, your message is safe, but please still contact support@thecoin.io',
      description: 'app.contactus.errorMessage: Error Message for the contact us page'},
  successMessage : {
      defaultMessage: 'Message received.\nYou should receive an answer in 1-2 business days.',
      description: 'app.contactus.successMessage: Success Message for the contact us page'},
  button : {
      defaultMessage: 'Send',
      description: 'app.contactus.form.button: For the button in the contact us page'}
});

export const ContactUs = () => {
  const [message, setMessage] = useState('');
  const [successHidden] = useState(true);
  const [errorHidden] = useState(true);

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    console.log(message);
    setMessage("");
    //setSuccessHidden(false);
  }

  return (
    <React.Fragment>
      <PageHeader
          illustration={illustration}
          title={translations.title}
          description= {translations.description}
      />
      <AppContainerWithShadow className={`${styles.containerContactUs}`}>

      <AvailableSoon>
        <div className={styles.messagesContainer}>
          <div>
            <div className={styles.contactFormLine}>
              <ContactForm
                errorMessage={translations.errorMessage}
                errorHidden={errorHidden}
                successMessage={translations.successMessage}
                successHidden={successHidden}

                button={translations.button}
                onSubmit={onSubmit}
              />
              </div>
            </div>
            {/*<UserMessage
              message={"Hi"}
              messageComplement={"you - 2 days ago"}
              contactAvatar={getAvatarLink("14")}
            contactVerified={false}
            /> */}
            <Answer
              message={"Welcome to the contact us page"}
              messageComplement={"Admin - 2 days ago"}
              contactAvatar={coin}
              contactVerified={true}
            />
        </div>

        </AvailableSoon>
      </AppContainerWithShadow>
    </React.Fragment>
  );
}

