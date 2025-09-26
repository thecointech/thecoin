import { Button } from "semantic-ui-react"
import { useHistory } from "react-router-dom"
import { DefaultPathProps, usePathIndex } from "./types"
import styles from './NextButton.module.less';

export const PathNextButton = ({path}: DefaultPathProps) => {
    const navigate = useHistory();
    const currentStep = usePathIndex();
    const buttonDisplay = currentStep == (path.routes.length - 1)
      ? "none"
      : undefined;

    const navigateNext = () => {
      navigate.push(`/${path.groupKey}/${currentStep + 1}`);
    }
  return (
    <Button className={styles.nextButton} style={{display: buttonDisplay}} onClick={navigateNext}>Next</Button>
  )
}
