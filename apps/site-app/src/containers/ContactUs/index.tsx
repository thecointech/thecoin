import * as React from 'react';
import illustration from './images/icon_contact_big.svg';
import {AppContainerWithShadow} from 'components/AppContainers';
//import { AvailableSoon } from "@thecointech/shared/containers/Widgets/AvailableSoon";
import coin from './images/thecoin_icon.svg';
import { useIntl } from 'react-intl';
import { ContactForm } from './Form';
import { useState } from 'react';
import { UserMessage, Answer } from './Messages';
import { getAvatarLink } from '@thecointech/shared/components/Avatars';
import { PageHeader } from '../PageHeader';
import styles from './styles.module.less';

const title = { id:"app.contactus.title",
                defaultMessage:"Contact Us",
                description:"Main title for the Contact Us page in the app" };
const description = { id:"app.contactus.description",
                      defaultMessage:"Send us a secured message and we will answer as quickly as we can",
                      description:"Description for the Contact Us page in the app" };

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
      <PageHeader 
          illustration={illustration}
          title={title}
          description= {description}
      />
      <AppContainerWithShadow className={styles.containerContactUs}>
        <div className={styles.messagesContainer}>
          <div>
            <div className={styles.contactFormLine}>
              <ContactForm
                errorMessage={errorMessage}
                errorHidden={errorHidden}
                successMessage={successMessage}
                successHidden={successHidden}

                messageLabel={messageLabel}
                setMessage={(value: string) => setMessage(value)}
                messageDes={intl.formatMessage(messageDesc)}

                button={button}
                onSubmit={onSubmit}
              />
              </div>
            </div>
            <UserMessage 
              message={"Hi"} 
              messageComplement={"you - 2 days ago"} 
              contactAvatar={getAvatarLink("14")} 
              contactVerified={false}  
            />
            <Answer 
              message={"Welcome to the contact us page"} 
              messageComplement={"Admin - 2 days ago"}  
              contactAvatar={coin} 
              contactVerified={true} 
            />
        </div>
      </AppContainerWithShadow>
    </React.Fragment>
  );
}

