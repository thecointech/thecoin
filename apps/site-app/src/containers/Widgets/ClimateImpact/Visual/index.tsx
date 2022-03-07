import React from "react";
import { FormattedMessage, MessageDescriptor } from "react-intl";
import { Header } from "semantic-ui-react";
import styles from "./styles.module.less";

export type VisualProps = {
    title: MessageDescriptor,
    quantity: string,
    item: {
            key: string,
            class: string,
            unityToTranslate: MessageDescriptor,
            textToTranslate: MessageDescriptor
        }
}

export const Visual = (props: VisualProps) => {
  return (
    <div className={ `${styles.climateImpact} ${props.item.class}` }>
      <Header as="h5">
        <FormattedMessage {...props.title} />
      </Header>
      <div className={styles.textZone}>
        <Header as="h3">
            {props.quantity}
        </Header> &nbsp;
        <Header as="h4">
          <FormattedMessage {...props.item.unityToTranslate} />
        </Header>
        <br  />
        <FormattedMessage {...props.item.textToTranslate} />
      </div>
    </div>
  )
}
