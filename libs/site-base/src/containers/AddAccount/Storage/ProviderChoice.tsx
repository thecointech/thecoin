import React, { type PropsWithChildren } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Link } from 'react-router';
import { Loader, Header, Dimmer } from 'semantic-ui-react'
import styles from './styles.module.less';
import { usePreserveQuery } from '../utils';

type InnerProps = {
  imgSrc: string;
  txt: MessageDescriptor;
}
type BaseProps = {
  loading?: boolean;
} & InnerProps;
type LinkProps = { link: string }
type ClickProps = {onClick?: () => void}
// you can have either link or onClick, but not both
type Props = BaseProps & (LinkProps | ClickProps);

export const ProviderChoice = ({ loading, ...props }: Props) => {
  return (
    <div className={styles.choice} >
      <Dimmer active={loading} inverted>
        <Loader inverted>Loading</Loader>
      </Dimmer>
      {
        "link" in props
          ? <WithLink link={props.link}><Inner {...props} /></WithLink>
          : "onClick" in props
            ? <WithClick onClick={props.onClick}><Inner {...props} /></WithClick>
            : <Inner {...props} />
      }
    </div>
  )
}

const WithLink = ({ link, children }: PropsWithChildren<LinkProps>) => {
    const to = usePreserveQuery(link);
    return (
      <Link to={to} >
        {children}
      </Link>
    )
}

const WithClick = ({ onClick, children }: PropsWithChildren<ClickProps>) =>
  <div onClick={onClick} className={styles.clickable}>
    {children}
  </div>

const Inner = ({ imgSrc, txt }: InnerProps) => (
  <>
    <img src={imgSrc} />
    <Header as={"h4"}><FormattedMessage {...txt} /></Header>
  </>
)

