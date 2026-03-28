import React from "react";
import { Icon, Popup } from "semantic-ui-react"
import { ScorePill } from "./ScorePill"
import { ccqiStructure } from './structure'
import type { Section, SimpleData } from "./types"
import styles from './Summary.module.css';
import { CcqiHeader } from "./CcqiHeader";

type Props = {
  data: SimpleData
  toggleExpanded: () => void;
  expanded: boolean;
}
export const Summary = ({ data, toggleExpanded, expanded }: Props) => {

  return (
    <div
      className={styles.pillSummary}
      onClick={() => toggleExpanded()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleExpanded()}
    >
      <span>
        <CcqiHeader />
        <Icon
          name="dropdown"
          className={`${styles.expandChevron} ${expanded ? styles.expanded : ""}`}
        />
      </span>

      {ccqiStructure.map((section) => (
        <SummaryScorePill key={section.key} section={section} data={data} />
      ))}
    </div>
  )
}

type SummaryScorePillProps = {
  section: Section,
  data: SimpleData
}
const SummaryScorePill = ({ section, data}: SummaryScorePillProps) => {
  const text = section.label
  return (
  <div>
      <Popup
        content={text}
        position="top left"
        trigger={<ScorePill value={data[section.key] as number | null} />}
      />
  </div>
)}
