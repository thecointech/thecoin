import { Accordion, Icon } from "semantic-ui-react";
import { ScorePill } from "./ScorePill";
import { ccqiStructure } from "./structure";
import type { SimpleData } from "./types";
import styles from "./Detailed.module.css";

type DetailedProps = {
  data: SimpleData;
  activeIndices: Set<number>;
  onCollapse: () => void;
  onSectionClick: (index: number) => void;
};

export const Detailed = ({
  data,
  activeIndices,
  onSectionClick,
}: DetailedProps) => {
  return (
    <Accordion styled id={styles.detailedContainer}>
      {ccqiStructure.map((section, sIdx) => {
        const hasChildren = section.children.length > 0;
        return (
          <div key={section.key}>
            <Accordion.Title
              active={activeIndices.has(sIdx)}
              onClick={() => hasChildren && onSectionClick(sIdx)}
              className={!hasChildren ? styles.noExpand : undefined}
            >
              {hasChildren && <Icon name="dropdown" />}
              <ScorePill value={data[section.key] as number | null} />
              <span className={styles.sectionLabel}>{section.label}</span>
            </Accordion.Title>
            {hasChildren && (
              <Accordion.Content active={activeIndices.has(sIdx)}>
                {section.children.map((sub) => (
                  <div key={sub.key} className={styles.subSection}>
                    <div className={styles.subHeader}>
                      <ScorePill value={data[sub.key] as number | null} size="mini" />
                      <span>{sub.label}</span>
                    </div>
                    {sub.children.length > 0 && (
                      <div className={styles.subSubList}>
                        {sub.children.map((subsub) => (
                          <div key={subsub.key} className={styles.subSubItem}>
                            <ScorePill value={data[subsub.key] as number | null} size="mini" />
                            <span>{subsub.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Accordion.Content>
            )}
          </div>
        );
      })}
    </Accordion>
  );
};
