/**
 * We Do More Page
 */

import * as React from 'react';
import { WeDoMoreMobile } from 'containers/WeDoMore/WeDoMoreMobile';
import { CreateAccountBanner } from 'containers/CreateAccountBanner';

import { GreaterThanMobileSegment, MobileSegment } from 'components/ResponsiveTool'; 
import { WeDoMoreGreaterThanMobile } from './WeDoMoreGreaterThanMobile';

export function WeDoMore() {
  return (
      <>
        <GreaterThanMobileSegment>
            <WeDoMoreGreaterThanMobile />
        </GreaterThanMobileSegment>
        <MobileSegment>
            <WeDoMoreMobile />
        </MobileSegment>
        <CreateAccountBanner />
    </>
  );
}
