import { buildReducer } from "./reducer";
import React from "react";


// This dummy react component is only used
// as a way to conveniently mount the Fx Reducer
class FxRateDummy extends React.PureComponent {
  render = () => <></>
}

export const FxRates = buildReducer()(FxRateDummy)


