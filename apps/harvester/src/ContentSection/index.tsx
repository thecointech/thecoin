import { ReactNode, useRef, useEffect, useState } from 'react'
import styles from "./index.module.less"
import { AlternateLink } from './Alternate'
import { NextButton } from './Next'
import { ContentSectionContext } from './context'
import { ActionButton } from './Action'

type ContentSectionProps = {
  children: ReactNode;
  className?: string;
}

export const ContentSection = ({ children, className }: ContentSectionProps) => {
  const alternatePortalRef = useRef<HTMLDivElement>(null);
  const nextPortalRef = useRef<HTMLDivElement>(null);
  const [hasAlternate, setHasAlternate] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [portalTargets, setPortalTargets] = useState<{
    alternatePortalTarget: HTMLElement | null;
    nextPortalTarget: HTMLElement | null;
  }>({ alternatePortalTarget: null, nextPortalTarget: null });

  const showFooter = hasAlternate || hasNext;
  // Update portal targets when footer visibility changes
  useEffect(() => {
    setPortalTargets({
      alternatePortalTarget: alternatePortalRef.current,
      nextPortalTarget: nextPortalRef.current,
    });
  }, [showFooter]);


  return (
    <ContentSectionContext.Provider value={{
      ...portalTargets,
      setHasAlternate,
      setHasNext
    }}>
      <div className={className ? `${styles.contentSection} ${className}` : styles.contentSection}>
        <div className={styles.contentArea}>
          {children}
        </div>
        {showFooter && (
          <div className={styles.footer}>
            <div className={styles.footerLeft} ref={alternatePortalRef} />
            <div className={styles.footerRight} ref={nextPortalRef} />
          </div>
        )}
      </div>
    </ContentSectionContext.Provider>
  );
};

// Attach compound components
ContentSection.Action = ActionButton;
ContentSection.Alternate = AlternateLink;
ContentSection.Next = NextButton;
