import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';

// The initial state of the App
export const initialState: ContainerState = {
  height: 250,
};

// const lastTimeStamp = 0;

// Take this container's state (as a slice of root state), this container's actions and return new state
function measureReducer(
  state: ContainerState = initialState,
  action: ContainerActions,
): ContainerState {
  switch (action.type) {
    case ActionTypes.SET_HEIGHT:
      // if (action.payload.timestamp <= lastTimeStamp) return state;
      // lastTimeStamp = action.payload.timestamp;
      return {
        ...state,
        height: action.payload.height,
      };
    default:
      return state;
  }
}

export default measureReducer;
