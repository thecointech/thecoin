import React from 'react';
import sky from './images/sky.svg';
import landscapeSkyCloudsHigh from './images/cloudsBackgroundHigh.svg';
import landscapeSkyCloudsLeft from './images/cloudsLeft.svg';
import landscapeSkyCloudsRight from './images/cloudsRight.svg';
import Birds from './images/birds.svg';
import Sun from './images/sun.svg';
import SunAura from './images/sunAura.svg';
import landscapeGreenPart from './images/landscape.svg';
import styles from './background.module.less';

export const Background = () => (
  <div className={styles.background}>
    <img className={styles.sky} src={sky} />
    <img className={styles.cloudsHigh} src={landscapeSkyCloudsHigh} />
    <img className={styles.cloudsLeft} src={landscapeSkyCloudsLeft} />
    <img className={styles.cloudsRight} src={landscapeSkyCloudsRight} />
    <img className={styles.sunAura} src={SunAura} />
    <img className={styles.sun} src={Sun} />
    <img className={styles.birds} src={Birds} />
    <img className={styles.greenery} src={landscapeGreenPart} />
  </div>
)
