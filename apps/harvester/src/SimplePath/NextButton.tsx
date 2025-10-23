// import { Button } from "semantic-ui-react"
// import { useHistory } from "react-router-dom"
import { usePathIndex } from "./types"
import { NextButton } from "../ContentSection/Next";
import { useRouteMatch } from "react-router";
// import styles from './NextButton.module.less';

interface PathNextButtonProps {
  onValid?: () => boolean;
}

export const PathNextButton = (props: PathNextButtonProps) => {
  const currentStep = usePathIndex();
  const match = useRouteMatch();
  const groupKey = match.path.split("/")[1];

  return (
    <NextButton to={`/${groupKey}/${currentStep + 1}`} content="Next" onValid={props.onValid} />
  )
}
