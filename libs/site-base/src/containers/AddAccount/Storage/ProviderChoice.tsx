import React from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Link } from 'react-router-dom';
import { Header } from 'semantic-ui-react';

type Props = {
  link: string,
  imgSrc: string,
  txt: MessageDescriptor
}

export const ProviderChoice = ({link, imgSrc, txt}: Props) =>
  <Link to={link}>
    <img src={imgSrc} />
    <Header as={"h4"}><FormattedMessage {...txt} /></Header>
  </Link>
