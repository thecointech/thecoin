"use client";

import { FC, useMemo, useState } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import styles from "./index.module.css";
import { Summary } from "./Summary";
import { Detailed } from "./Detailed";

export type CcqiScoreProps = SliceComponentProps<Content.CcqiScoreSlice>;

export const CcqiScore: FC<CcqiScoreProps> = ({ slice }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());
  const data = slice.primary;
  const category = data.category;
  const hasScores = data.s01 != null;

  const toggleExpanded = useMemo(() => () => setExpanded(old => !old), [setExpanded]);
  const handleSectionClick = (index: number) => {
    setActiveIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!hasScores) {
    return (
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className={styles.ccqiScore}
      >
        <div className={styles.noScores}>
          <strong>CCQI Score: N/A</strong>
          {category && <span> (This category &mdash; {category} &mdash; does not have scoring available.)</span>}
        </div>
      </section>
    );
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={styles.ccqiScore}
    >
      <Summary data={data} toggleExpanded={toggleExpanded} expanded />
      {expanded && (
        /* Expanded: full accordion */
        <Detailed
          data={data}
          activeIndices={activeIndices}
          onCollapse={() => setExpanded(false)}
          onSectionClick={handleSectionClick}
        />
      )}
    </section>
  );
};

export default CcqiScore
