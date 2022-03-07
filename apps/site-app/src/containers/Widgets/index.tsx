import { AccountMap } from '@thecointech/shared/containers/AccountMap'
import React from 'react';
import { useLocation } from 'react-router';
import { AppContainerWithShadowWithoutPadding } from '../../components/AppContainers';
import styles from './styles.module.less';
export * from './Balance/Widget';
export * from './ClimateImpact/Widget';

type Props = {
  area: "top"|"bottom"
}
export const WidgetWrapper: React.FC<Props> = ({area, children}) => {
  const active = AccountMap.useActive();
  const location = useLocation();
  const showWidget = active?.contract && !location.pathname.startsWith("/addAccount");
  return showWidget
    ? <div className={styles[area]}>
        <AppContainerWithShadowWithoutPadding>
          {children}
        </AppContainerWithShadowWithoutPadding>
      </div>
    : null;
}
