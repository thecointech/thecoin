import * as React from 'react';

import { CreateAccountBanner, TypeCreateAccountBanner } from '../CreateAccountBanner';
import { HealthierMobile } from './HealthierMobile';
import { HealthierGreaterThanMobile } from './HealthierGreaterThanMobile/index';
import { GreaterThanMobileSegment, MobileSegment } from 'components/ResponsiveTool';

import styles from './styles.module.less';

export function Healthier() {

  return (
    <>
      <div className={ `${styles.wrapper} x10spaceBefore x20spaceAfter` }>
        <GreaterThanMobileSegment>
          <HealthierGreaterThanMobile />
        </GreaterThanMobileSegment>

        <MobileSegment>
          <HealthierMobile />
        </MobileSegment>
      </div>

      <CreateAccountBanner Type={ TypeCreateAccountBanner.People } />
    </>
  );
}
