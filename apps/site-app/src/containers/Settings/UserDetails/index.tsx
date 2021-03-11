import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import * as React from 'react';
import { useState } from 'react';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import { FormattedMessage } from 'react-intl';
import { AccountVerified } from '../Verified';
import { Avatars } from '@the-coin/shared/components/Avatars';
import { Form, Grid, Icon, Reveal } from 'semantic-ui-react';
import { CopyToClipboard } from '@the-coin/site-base/components/CopyToClipboard';
import { IActions, useAccountApi } from '@the-coin/shared/containers/Account';
import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';


const accountNameLabel = { id:"app.settings.userDetails.name",
                defaultMessage:"Account name",
                description:"Label for the info for the tab User details in the setting page in the app" };
const addressLabel = { id:"app.settings.userDetails.address",
                defaultMessage:"Personal Details",
                description:"Label for the info for the tab User details in the setting page in the app" };
const code = { id:"app.settings.userDetails.code",
                defaultMessage:"Referral code",
                description:"Label for the info for the tab User details in the setting page in the app" };
const codeInfos = { id:"app.settings.userDetails.codeInfos",
                defaultMessage:"You need to verify your account to obtain one",
                description:"Infos for the info for the tab User details in the setting page in the app" };
const edit = { id: "app.settings.userDetails.edit",
                defaultMessage: "Edit",
                description: "Edit zone for the page setting / tab personal details in the app"
              };
const button = { id: "app.settings.userDetails.button",
              defaultMessage: "Save",
              description: "Content for the page setting / tab personal details in the app"
            };


function setNewAccountName(accountActions:IActions,newName: string){
  accountActions.setName(newName);
}

export const UserDetails = () => {
  const activeAccount = useActiveAccount();
  const [accountName, setAccountName] = useState(activeAccount!.name);
  const [accountNameEdit, setAccountNameEdit] = useState(false);
  const { address } = activeAccount!;
  const accountActions = useAccountApi(address);

  return (
    <React.Fragment>
        <Grid className={ `${styles.userDetailHeader} x2spaceAfter` } id={sharedStyles.editableInfo} stackable >
          <Grid.Row>
            <Grid.Column width={4} textAlign="center" verticalAlign="middle">
              <Avatars index="14" />
            </Grid.Column>
            <Grid.Column width={12} verticalAlign="middle">
              <div className={"x4spaceAfter"}>
                <Form.Input
                  style={{width: "100%"}}
                  onChange={event => setAccountName(event.target.value)}
                  label={<div>
                            <FormattedMessage {...accountNameLabel} />
                            <span onClick={()=>setAccountNameEdit(!accountNameEdit)} className={sharedStyles.edit}>
                              <Icon name={"edit"} /><FormattedMessage {...edit} />
                            </span>
                        </div>}
                  value={accountName} readOnly={!accountNameEdit} />

                  <Reveal animated='small fade'>
                    <Reveal.Content visible>
                      <ButtonTertiary id={styles.buttonToSave} active={accountNameEdit} onClick={()=>setNewAccountName(accountActions,accountName)}>
                        <FormattedMessage {...button} />
                      </ButtonTertiary>
                    </Reveal.Content>
                  </Reveal>
                </div> 
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <AccountVerified verified={false} />
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...addressLabel}/></div>
        <div className={"font-big x4spaceAfter"}>
          {activeAccount?.address} <CopyToClipboard payload={activeAccount?.address!} />
        </div>
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...code}/></div>
        <div className={"x4spaceAfter"}><FormattedMessage {...codeInfos}/></div>
    </React.Fragment>
  );
}

