import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Header, List, Icon } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';
import styles from './styles.module.less';

const translations = defineMessages({
  title: {
    defaultMessage: 'Download Harvester',
    description: 'site.download.title: title for the download page',
  },
  blurb: {
    defaultMessage: 'Download the latest version of the Harvester for your platform.',
    description: 'site.download.blurb: page introduction text',
  },
  windows: {
    defaultMessage: 'Windows',
    description: 'site.download.windows: Windows download button label',
  },
  mac: {
    defaultMessage: 'macOS',
    description: 'site.download.mac: macOS download button label',
  },
  linux: {
    defaultMessage: 'Linux',
    description: 'site.download.linux: Linux download button label',
  },
});

const artifactBaseUrl = process.env.URL_HARVESTER_ARTIFACTS ?? 'https://storage.googleapis.com/tccc-releases/harvester';

function getDownloadLinks() {
  const configName = process.env.CONFIG_NAME ?? 'prod';
  const channelSuffix = configName === 'prod'
    ? ''
    : configName.charAt(0).toUpperCase() + configName.slice(1);

  return [
    {
      key: 'windows',
      label: translations.windows,
      platform: 'win32',
      filename: `Harvester${channelSuffix}Setup.exe`,
    },
    {
      key: 'mac',
      label: translations.mac,
      platform: 'darwin',
      filename: `Harvester${channelSuffix}.dmg`,
    },
    {
      key: 'linux',
      label: translations.linux,
      platform: 'linux',
      filename: `Harvester${channelSuffix}.deb`,
    },
  ].map(link => ({
    ...link,
    url: `${artifactBaseUrl}/${configName}/${link.platform}/${link.filename}`,
  }));
}

export const DownloadPage = () => {
  const links = getDownloadLinks();

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Download Harvester | TheCoin</title>
        <meta name="description" content="Download the latest version of the Harvester for your platform." />
      </Helmet>

      <Header as="h2" className="x10spaceBefore">
        <FormattedMessage {...translations.title} />
      </Header>
      <p>
        <FormattedMessage {...translations.blurb} />
      </p>

      <List relaxed className={styles.list}>
        {links.map(link => (
          <List.Item key={link.key}>
            <ButtonPrimary
              as="a"
              href={link.url}
              download={link.filename}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="download" />
              <FormattedMessage {...link.label} />
            </ButtonPrimary>
          </List.Item>
        ))}
      </List>
    </div>
  );
};
