import { Button } from "semantic-ui-react"
import { useHistory, useLocation } from "react-router-dom"
import { DefaultPathProps } from "./types"

export const PathNextButton = ({path}: DefaultPathProps) => {
    const navigate = useHistory();
    const location = useLocation();
    const curr = location.pathname;
    const m = curr.match(/\/([0-9])$/)
    // Disable "next" button if we're on the last step
    const currentStep = parseInt(m?.[1] || "0");
    const buttonDisplay = currentStep == (path.routes.length - 1)
      ? "none"
      : undefined;

    const navigateNext = () => {
      // Page is last number
      // if (m) {
        navigate.push(`/${path.groupKey}/${currentStep + 1}`);
      // } else {
      //   navigate.push(`/${path.groupKey}/0`);
      // }
    }
  return (
    <Button style={{display: buttonDisplay}} onClick={navigateNext}>Next</Button>
  )
}
