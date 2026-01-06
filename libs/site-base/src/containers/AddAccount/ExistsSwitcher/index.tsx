import React from "react"
import { Dropdown } from "semantic-ui-react"
import { Link } from "react-router"
import styles from './styles.module.less'
import { defineMessages, useIntl } from "react-intl"

type ExistTypes = "connect"|"upload"|"restore"

const translations = defineMessages({
  existTransfer: {
    defaultMessage: 'Load using a different method',
    description: 'app.addAccount.existsSwitcher.existTransfer'},
  existRestore: {
    defaultMessage: 'Load an account stored online',
    description: 'app.addAccount.existsSwitcher.existRestore'},
  existConnect: {
    defaultMessage: 'Connect to an existing Ethereum Account',
    description: 'app.addAccount.existsSwitcher.existConnect'},
  existUpload: {
    defaultMessage: 'Upload an account saved manually',
    description: 'app.addAccount.existsSwitcher.existUpload'},
});

const Options = [
  {
    name: "restore",
    text: translations.existRestore,
  },
  {
    name: "connect",
    text: translations.existConnect,
  },
  {
    name: "upload",
    text: translations.existUpload,
  }
];

export type Props = {
  filter: ExistTypes
}

export const ExistsSwitcher = (props: Props) => {
  const intl = useIntl();

  return (
    <>
      <Dropdown text={intl.formatMessage(translations.existTransfer)} className={styles.dropdown}>
        <Dropdown.Menu>
          {
            Options
              .filter(o => o.name != props.filter)
              .map(o => <Dropdown.Item key={o.name} text={intl.formatMessage(o.text)} as={Link} to={`/addAccount/${o.name}`} />)
          }
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}
