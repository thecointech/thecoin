import * as React from 'react';
import { useIntl } from 'react-intl';

import { GreaterThanMobileSegment, MobileSegment } from '@the-coin/site-base/components/ResponsiveTool';
import { LandscapeGreaterThanMobile } from './LandscapeGreaterThanMobile';
import { LandscapeMobile } from './LandscapeMobile';

const title = { id:"site.homepage.landscape.title",
                defaultMessage:"The future is brighter",
                description:"The title for the homepage"};
const description = { id:"site.homepage.landscape.description",
                      defaultMessage:"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet.",
                      description:"Description following the main title"};

export const Landscape = () => {

const intl = useIntl();
const titleTranslated = intl.formatMessage(title);
const descriptionTranslated = intl.formatMessage(description);
  return (
      <>
        <GreaterThanMobileSegment>
          <LandscapeGreaterThanMobile mainTitle={titleTranslated} mainDescription={descriptionTranslated} />
        </GreaterThanMobileSegment>

        <MobileSegment>
          <LandscapeMobile mainTitle={titleTranslated} mainDescription={descriptionTranslated} />
        </MobileSegment>
      </>
  );
}

