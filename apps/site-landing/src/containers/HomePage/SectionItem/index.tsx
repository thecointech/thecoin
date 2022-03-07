import React from 'react'
import { FormattedMessage, MessageDescriptor } from 'react-intl'
import { Header } from 'semantic-ui-react'
import { LearnMoreLink } from '../../../components/LearnMoreLink'
import styles from './styles.module.less';

type Props = {
  img: any,
  to: string,
  text: {
    title: MessageDescriptor,
    description: MessageDescriptor,
    link: MessageDescriptor,
  }

  className?: string
}

export const SectionItem = (props: Props) => (
  <div className={styles.item}>
    <div>
      <img src={props.img} />
      <Header as='h4'>
        <FormattedMessage {...props.text.title} />
      </Header>
      <p>
        <FormattedMessage {...props.text.description} />
      </p>
    </div>
    <div>
      <LearnMoreLink to={props.to}><FormattedMessage {...props.text.link} /></LearnMoreLink>
    </div>
  </div>
)
