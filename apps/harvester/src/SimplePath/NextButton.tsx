import { NextButton } from "../ContentSection/Next";
import { useSimplePathContext } from "./SimplePathContext";
import { usePathIndex } from "./types";

interface PathNextButtonProps {
  onValidate?: () => boolean;
}

export const PathNextButton = (props: PathNextButtonProps) => {
  const { path, onValidate } = useSimplePathContext();
  if (!path) {
    throw new Error("PathNextButton must be used within a ContentSection");
  }
  const index = usePathIndex(path);
  const next = path.routes[index + 1];

  const onValid = props.onValidate ?? onValidate;

  return next
    ? <NextButton to={`/${path.groupKey}/${next.path}`} onValid={onValid} />
    : null
}
