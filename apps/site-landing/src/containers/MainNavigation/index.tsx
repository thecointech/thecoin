import React from 'react';
import { GreaterThanMobileSegment, MobileSegment } from '@thecointech/shared/components/ResponsiveTool';
import {MainNavigationMobile} from './MainNavigationMobile';
import {MainNavigationGreaterThanMobile} from './MainNavigationGreaterThanMobile';

class Navigation extends React.Component {
  render() {
    return (
      <>
        <GreaterThanMobileSegment>
          <MainNavigationGreaterThanMobile />
        </GreaterThanMobileSegment>

        <MobileSegment>
          <MainNavigationMobile />
        </MobileSegment>
      </>
    );
  }
}

export default Navigation;
