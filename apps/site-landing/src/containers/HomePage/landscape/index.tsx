import * as React from 'react';
import { useIntl } from 'react-intl';

import { GreaterThanMobileSegment, MobileSegment } from '@thecointech/shared/components/ResponsiveTool';
import { LandscapeGreaterThanMobile } from './LandscapeGreaterThanMobile';
import { LandscapeMobile } from './LandscapeMobile';

const title = { id:"site.homepage.landscape.title",
                defaultMessage:"The future is brighter",
                description:"The title for the homepage"};
const description = { id:"site.homepage.landscape.description",
                      defaultMessage:"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet.",
                      description:"Description following the main title"};
const button = {  id:"site.homepage.landscape.button",
                  defaultMessage:"Start Now",
                  description:"Button label for the landscape"};

export const Landscape = () => {

const intl = useIntl();
const titleTranslated = intl.formatMessage(title);
const descriptionTranslated = intl.formatMessage(description);
const buttonTranslated = intl.formatMessage(button);
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

