import { Icon, Popup } from "semantic-ui-react"
import { ScorePill } from "./ScorePill"
import { ccqiStructure } from './structure'
import type { Section, SimpleData } from "./types"
import styles from './Summary.module.css';

type Props = {
  data: SimpleData
  toggleExpanded: () => void;
  expanded: boolean;
}
export const Summary = ({ data, toggleExpanded }: Props) => {

  return (
    <div
      className={styles.pillSummary}
      onClick={() => toggleExpanded()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleExpanded()}
    >
      <a
        href="https://carboncreditquality.org/scores.html"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        CCQI Scores:
      </a>
      {ccqiStructure.map((section) => (
        <SummaryScorePill key={section.key} section={section} data={data} />
      ))}
      <div className={styles.expandHint}>
        <Icon name="angle down" size="small" />
      </div>
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
