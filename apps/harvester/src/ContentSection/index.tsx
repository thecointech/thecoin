import styles from "./index.module.less"

export const ContentSection: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={className ? `${styles.container} ${className}` : styles.container}>
    {children}
  </div>
)
