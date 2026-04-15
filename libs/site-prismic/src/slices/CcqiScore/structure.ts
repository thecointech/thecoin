import { Section } from "./types";

export const ccqiStructure: Section[] = [
  {
    key: "s01", label: "Robust determination of the GHG emission impact",
    children: [
      {
        key: "s01a", label: "Additionality",
        children: [
          { key: "s01a1", label: "Eligibility of activities triggered by legal requirements" },
          { key: "s01a2", label: "Consideration of carbon credits before decision to proceed" },
          { key: "s01a3", label: "Financial attractiveness" },
          { key: "s01a4", label: "Barriers" },
        ],
      },
      { key: "s01b", label: "Vulnerability", children: [] },
      {
        key: "s01c", label: "Robust quantification of emission reductions and removals",
        children: [
          { key: "s01c1", label: "Robustness of the general program principles and provisions" },
          { key: "s01c2", label: "Robustness of the quantification methodologies applied" },
        ],
      },
    ],
  },
  {
    key: "s02", label: "Avoiding double counting",
    children: [
      { key: "s02a", label: "Robust registry and project database systems", children: [] },
      {
        key: "s02b", label: "Avoiding double issuance",
        children: [
          { key: "s02b1", label: "Due to double registration" },
          { key: "s02b2", label: "Due to indirect overlaps between projects" },
        ],
      },
      { key: "s02c", label: "Avoiding double use", children: [] },
      {
        key: "s02d", label: "Avoiding double claiming",
        children: [
          { key: "s02d1", label: "Host country provisions for avoiding double claiming with NDC" },
          { key: "s02d2", label: "Carbon crediting program provisions for avoiding double claiming with NDCs" },
          { key: "s02d3", label: "Avoiding double claiming with mandatory domestic mitigation schemes" },
        ],
      },
    ],
  },
  {
    key: "s03", label: "Addressing non-permanence",
    children: [
      {
        key: "s03a", label: "Robustness of the carbon crediting program's approaches",
        children: [
          { key: "s03a1", label: "Approaches for accounting and compensating for reversals" },
          { key: "s03a2", label: "Approaches for avoiding or reducing non-permanence risks" },
        ],
      },
    ],
  },
  {
    key: "s04", label: "Facilitating transition towards net zero emissions",
    children: [],
  },
  {
    key: "s05", label: "Strong institutional arrangements and processes",
    children: [
      { key: "s05a", label: "Overall program governance", children: [] },
      { key: "s05b", label: "Transparency", children: [] },
      { key: "s05c", label: "Robust third-party auditing", children: [] },
    ],
  },
  {
    key: "s06", label: "Environmental and social impacts",
    children: [
      { key: "s06a", label: "Robustness of environmental and social safeguards", children: [] },
      { key: "s06b", label: "Sustainable development impacts", children: [] },
      { key: "s06c", label: "Contribution to improving adaptation and resilience", children: [] },
    ],
  },
  {
    key: "s07", label: "Host country ambition",
    children: [
      { key: "s07a", label: "Host country commitment to global temperature goal", children: [] },
      { key: "s07b", label: "Stringency and coverage of host country's current NDC", children: [] },
      { key: "s07c", label: "Ability of carbon crediting approach to enable host country to achieve NDC", children: [] },
    ],
  },
];
