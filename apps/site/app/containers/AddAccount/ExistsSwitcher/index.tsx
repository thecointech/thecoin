import React from "react"
import { Divider, Dropdown } from "semantic-ui-react"
import { Link } from "react-router-dom"
import styles from './styles.module.css'
import messages from './messages'
import { useIntl } from "react-intl"

type ExistTypes = "connect"|"upload"|"restore"

const Options = [
  {
    name: "restore",
    text: messages.existRestore,
  },
  {
    name: "connect",
    text: messages.existConnect,
  },
  {
    name: "upload",
    text: messages.existUpload,
  }
];

export type Props = {
  filter: ExistTypes
}

export const ExistsSwitcher = (props: Props) => {
  const intl = useIntl();

  return (
    <>
      <Divider text="Or" />
      <Dropdown text={intl.formatMessage(messages.existTransfer)} className={styles.dropdown}>
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