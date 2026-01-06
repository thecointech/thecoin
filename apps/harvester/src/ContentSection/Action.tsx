import { Button, ButtonProps } from "semantic-ui-react"
import styles from "./Action.module.less";
import clsx from 'clsx';

export const ActionButton = ({className, ...props}: ButtonProps) => {

  const classes = clsx(className, styles.actionButton);
  return (
    <div className={styles.actionButtonContainer}>
      <Button {...props} className={classes} />
    </div>
  )
}
