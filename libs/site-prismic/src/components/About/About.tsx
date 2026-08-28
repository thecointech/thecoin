import React from "react";
import type { Content } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import styles from "./About.module.css";

export type AboutProps = {
  document: Content.AboutDocument;
};

export const About = ({ document }: AboutProps) => (
  <div className={styles.container}>
    <SliceZone slices={document.data.slices} components={components} />
  </div>
);
