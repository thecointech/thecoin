import * as React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { GreaterThanMobileSegment, MobileSegment } from '@thecointech/shared/components/ResponsiveTool';
import { LandscapeGreaterThanMobile } from './LandscapeGreaterThanMobile';
import { LandscapeMobile } from './LandscapeMobile';

const translations = defineMessages({
  title : {
      defaultMessage: 'The future is brighter',
      description: 'site.homepage.landscape.title: The title for the homepage'},
  description : {
      defaultMessage: 'Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet.',
      description: 'site.homepage.landscape.description: The description for the homepage'},
  button : {
      defaultMessage: 'Start Now',
      description: 'site.homepage.landscape.button: Button label for the landscape'}
  });

export const Landscape = () => {

const intl = useIntl();
const titleTranslated = intl.formatMessage(translations.title);
const descriptionTranslated = intl.formatMessage(translations.description);
const buttonTranslated = intl.formatMessage(translations.button);
  return (
      <>
        <GreaterThanMobileSegment>
          <LandscapeGreaterThanMobile mainTitle={titleTranslated} mainDescription={descriptionTranslated} mainButton={buttonTranslated} />
        </GreaterThanMobileSegment>

        <MobileSegment>
          <LandscapeMobile mainTitle={titleTranslated} mainDescription={descriptionTranslated} mainButton={buttonTranslated} />
        </MobileSegment>
      </>
  );
}

