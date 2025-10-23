import { Button, ButtonProps } from "semantic-ui-react"
import styles from "./Action.module.less";

// Do we actually need this?
export const ActionButton = ({className, ...props}: ButtonProps) => {

  const classes = `${className} ${styles.actionButton}`;
  return (
    <div className={styles.actionButtonContainer}>
      <Button {...props} className={classes} />
    </div>
  )
}
