import * as React from 'react';
import { useLocation } from 'react-router';
import { ContentFader } from '../ContentFader';
import { ContentHeightAnimate } from '../ContentHeightAnimate';
import { ContentHeightMeasure } from '../ContentHeightMeasure';
import { RouteMap, AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import styles from './styles.module.less';

type Props = {
  routes: RouteMap,
  contentId?: string,
};
export const MainPageTransition: React.FC<Props> = ({ contentId, routes }) => {
  const location = useLocation()
  return (
    <ContentHeightAnimate>
      <ContentFader location={location}>
        <ContentHeightMeasure>
          <section id={contentId} className={styles.pageMainInner}>
            <AuthSwitch {...routes} location={location} />
          </section>
        </ContentHeightMeasure>
      </ContentFader>
    </ContentHeightAnimate>
  );
}
