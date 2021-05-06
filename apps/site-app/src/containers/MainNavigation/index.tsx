import React from 'react';
import { GreaterThanMobileSegment, MobileSegment } from '@thecointech/shared/components/ResponsiveTool';
import {MainNavigationMobile} from './MainNavigationMobile';
import {MainNavigationGreaterThanMobile} from './MainNavigationGreaterThanMobile';

export const MainNavigation = () =>
  <>
    <GreaterThanMobileSegment>
      <MainNavigationGreaterThanMobile />
    </GreaterThanMobileSegment>

    <MobileSegment>
      <MainNavigationMobile />
    </MobileSegment>
  </>
