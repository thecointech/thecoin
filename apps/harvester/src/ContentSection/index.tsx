import styles from "./index.module.less"

export const ContentSection: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={styles.container + " " + className}>
    {children}
  </div>
)
