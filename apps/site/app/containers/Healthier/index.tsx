import * as React from 'react';

import { CreateAccountBanner } from '../CreateAccountBanner';
import { HealthierMobile } from './HealthierMobile';
import { GreaterThanMobileSegment, MobileSegment } from 'components/ResponsiveTool'; 

import styles from './styles.module.css';
import { HealthierGreaterThanMobile } from './HealthierGreaterThanMobile/index';

export function Healthier() {

  return (
    <>
      <div className={styles.wrapper} id={styles.healthier}>
        <GreaterThanMobileSegment>
          <HealthierGreaterThanMobile />
        </GreaterThanMobileSegment>

        <MobileSegment>
          <HealthierMobile />
        </MobileSegment>
      </div>

        <CreateAccountBanner />
      </>
  );
}
