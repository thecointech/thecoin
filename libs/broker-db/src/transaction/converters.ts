import { buildConverter } from "../converter";
import { ActionType, ActionDataTypes, TransitionDelta, IncompleteRef } from "./types";

export const actionConverter = <Type extends ActionType>() => buildConverter<ActionDataTypes[Type]>(["timestamp"])
export const transitionConverter = buildConverter<TransitionDelta>(["timestamp"]);
export const incompleteConverter = buildConverter<IncompleteRef>([]);
