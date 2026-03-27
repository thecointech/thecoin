import { forwardRef } from "react";
import { Label, type StrictLabelProps, type SemanticCOLORS } from "semantic-ui-react";

function formatScore(value: number | null | undefined): string {
  if (value == null) return "NA";
  return value.toFixed(1);
}

function scoreColor(value: number | null | undefined): SemanticCOLORS {
  if (value == null) return "grey";
  if (value >= 4.5) return "olive";
  if (value >= 3.5) return "green";
  if (value >= 2.5) return "yellow";
  if (value >= 1.5) return "orange";
  return "red";
}

type Props = {
  value: number | null;
} & StrictLabelProps;

export const ScorePill = forwardRef<
  HTMLDivElement,
  Props>((props, ref) => {
  const {value, ...rest} = props;
  return (
    <Label
      ref={ref}
      {...rest}
      color={scoreColor(value)}
    >
      {formatScore(value)}
    </Label>
  )
});
