"use client";

import React, { type FC, useCallback, useState } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import styles from "./index.module.css";
import { Summary } from "./Summary";
import { Detailed } from "./Detailed";
import { CcqiHeader } from "./CcqiHeader";

export type CcqiScoreProps = SliceComponentProps<Content.CcqiScoreSlice>;

export const CcqiScore: FC<CcqiScoreProps> = ({ slice }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());
  const data = slice.primary;
  const category = data.category;
  const hasScores = data.s01 != null;

  const toggleExpanded = useCallback(() => setExpanded(old => !old), [setExpanded]);
  const handleSectionClick = useCallback((index: number) => {
    setActiveIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  if (!hasScores) {
    return (
      <>
        <section
          data-slice-type={slice.slice_type}
          data-slice-variation={slice.variation}
          className={styles.ccqiScore}
        >
          <div className={styles.noScores}>
            <CcqiHeader />
            N/A
            {category && <span> (Scoring for "<i>{category}</i>" not yet available)</span>}
          </div>
        </section>
        <CcqiLink />
      </>
    );
  }

  return (
    <>
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className={styles.ccqiScore}
      >
        <Summary data={data} toggleExpanded={toggleExpanded} expanded={expanded} />
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
      <CcqiLink />
    </>
  );
};

const CcqiLink = () => (
  <a
    href="https://carboncreditquality.org/scores.html"
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => e.stopPropagation()}
    className={styles.ccqiLink}
  >
    What are CCQI Scores?
  </a>

)

export default CcqiScore
