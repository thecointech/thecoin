import { usePathIndex } from "./types"
import { NextButton } from "../ContentSection/Next";
import { useLocation } from "react-router-dom";

interface PathNextButtonProps {
  onValid?: () => boolean;
}

export const PathNextButton = (props: PathNextButtonProps) => {
  const currentStep = usePathIndex();
  const location = useLocation();
  const groupKey = location.pathname.split("/")[1];

  return (
    <NextButton to={`/${groupKey}/${currentStep + 1}`} onValid={props.onValid} />
  )
}
