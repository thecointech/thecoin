import React, { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicLink, SliceComponentProps } from "@prismicio/react";
import styles from "./index.module.css";

/**
 * Props for `ProjectDetails`.
 */
export type ProjectDetailsProps =
  SliceComponentProps<Content.ProjectDetailsSlice>;

/**
 * Component for "ProjectDetails" Slices.
 */
const ProjectDetails: FC<ProjectDetailsProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <hr />
      <div className={styles.detailsGrid}>
        <div className={styles.label}>Purchase Record:</div>
        <div className={styles.value}>
          <PrismicLink field={slice.primary.offset} />
        </div>

        <div className={styles.label}>Project Documents:</div>
        <div className={styles.value}>
          <PrismicLink field={slice.primary.project_documents} />
        </div>
      </div>
      <hr />
    </section>
  );
};

export default ProjectDetails;
