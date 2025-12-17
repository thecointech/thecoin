import React from "react";
import type { Content } from "@prismicio/client";
import { RichText } from "../RichText";
import styles from "./FAQ.module.css";

export type FAQProps = {
  document: Content.FaqDocument;
}

export const FAQ = ({document}: FAQProps) => {
  return (
    <div className={styles.containerFAQ}>
      <RichText field={document.data.question} />
      <RichText field={document.data.answer} />
    </div>
  )
}
