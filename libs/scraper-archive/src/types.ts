
// Needed in AgentSerializer for logging things
export type VqaCallData = {
  args: (string|number)[],
  response: any,
}

export type TestElmData = any; //Omit<FoundElement, "element">;
export type TestSchData = any; // {
//   response?: any,
//   hints?: SearchElementData,
// } & Omit<ElementSearchParams, "page">;
