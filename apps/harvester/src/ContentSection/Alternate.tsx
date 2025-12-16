import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { useContentSectionContext } from './context'
import { Link } from 'react-router'

type AlternateLinkProps = {
  content: string;
  to: string;
}

export const AlternateLink = ({ to, content }: AlternateLinkProps) => {
  const { alternatePortalTarget, setHasAlternate } = useContentSectionContext();

  // Notify parent when button mounts/unmounts
  useEffect(() => {
    setHasAlternate(true);
    return () => setHasAlternate(false);
  }, [setHasAlternate]);

  if (!alternatePortalTarget) {
    return null;
  }

  return createPortal(
    <Link
      to={to}
    >
      {content}
    </Link>,
    alternatePortalTarget
  );
}
