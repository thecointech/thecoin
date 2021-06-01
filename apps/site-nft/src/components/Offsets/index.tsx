import { AppContainer } from 'components/AppContainers';
import * as React from 'react';
import { defineMessages } from 'react-intl';
import { List, Image, Popup } from 'semantic-ui-react';
import { PageHeader } from '../PageHeader';
import icon from './images/icon_topup_big.svg';
import randomhex from 'randomhex';
import styles from './styles.module.less'

const messages = defineMessages({
  title: { defaultMessage: "NFT Offsets", description: "NFT Offsets listings page title" },
  description: { defaultMessage: "Review the offsets each NFT has completed", description: "NFT Offsets listing description" },
})

const avatars = [
  'https://react.semantic-ui.com/images/avatar/small/rachel.png',
  'https://react.semantic-ui.com/images/avatar/small/lindsay.png',
  'https://react.semantic-ui.com/images/avatar/small/matthew.png',
  'https://react.semantic-ui.com/images/avatar/small/jenny.jpg',
  'https://react.semantic-ui.com/images/avatar/small/veronika.jpg'
]

export const Offsets = () => (
  <AppContainer shadow>
    <PageHeader illustration={icon} {...messages} />

    <List id={styles.offsets}>
      {
        avatars.map((av, idx) => (
          <List.Item key={idx}>
            <Image avatar src={av} />
            <List.Content>
              <OffsetHeader />
              <OffsetContent idx={idx} />
            </List.Content>
          </List.Item>
        )
        )
      }
    </List>
  </AppContainer>
);


const OffsetHeader = () => <List.Header className={styles.header}>{randomhex(20)}</List.Header>
const OffsetContent = (props: { idx: number }) =>
  <List.Description>
    Token: #{props.idx}&nbsp;
    Offset&nbsp;
    <Popup
      hoverable
      content={
        <span>
          Tonnes {12.2 * props.idx} to {12.2 * (props.idx + 1)}.6 of&nbsp;
          <a href="https://registry.goldstandard.org/credit-blocks?q=Gold+Standard+Marketplace+Order+GSM5722+&page=1">purchase GS5229</a>
        </span>
      }
      trigger={<a className={styles.trigger} onClick={() => false}>12.2 tonnes</a>}
    />
    &nbsp;
    on Jan 1st, 2022
  </List.Description>
