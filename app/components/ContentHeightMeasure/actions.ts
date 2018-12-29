import { action } from 'typesafe-actions';

import ActionTypes from './constants';

export const setContentHeight = (height: number, timestamp: number) =>
  action(ActionTypes.SET_HEIGHT, { height, timestamp });
