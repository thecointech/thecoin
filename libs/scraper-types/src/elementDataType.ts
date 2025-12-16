
export type Coords = {
  top: number,
  left: number,
  centerY: number,
  height: number,
  width: number,
}
export type Font = {
  font: string,
  color: string,
  size: string,
  style: string,
}
export type ElementData = {
  // The frames to dereference on our way to the data
  frame?: string
  // Note: always uppercase
  tagName: string,
  // HTML name attribute.  Not used in scoring, but is helpful
  // for grouping radio buttons together for VQA
  name?: string,
  // Options are not used in scoring, but are helpful
  // for determining the intent of an select in VQA
  options?: string[],
  // If tagName is INPUT, this will be the type
  // Note: inputType & role are always lowercase
  inputType?: string,
  // If tagName is LABEL, this will be the for attribute
  for?: string,

  role: string|null,

  selector: string,
  coords: Coords,
  label: string|null,
  // inner text
  text: string,
  // value of the actual node
  nodeValue?: string|null,
  font?: Font,
  siblingText?: string[],

  // Reference to parent element
  parentSelector?: string|null,
  parentTagName?: string,
}
