import { createPortal } from 'react-dom'
import { useEffect, type ReactNode } from 'react'
import { Link } from "react-router-dom"
import { Button } from "semantic-ui-react"
import { useContentSectionContext } from './context'

type NextButtonProps = {
  to: string;
  content: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onValid?: () => boolean;
}

export const NextButton = ({ to, content, disabled, loading, onValid }: NextButtonProps) => {
  const { nextPortalTarget, setHasNext } = useContentSectionContext();

  // Notify parent when button mounts/unmounts
  useEffect(() => {
    setHasNext(true);
    return () => setHasNext(false);
  }, [setHasNext]);

  if (!nextPortalTarget) {
    return null;
  }
  const onClick = onValid ? (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (!onValid()) {
      event.preventDefault();
    }
  } : undefined;

  return createPortal(
    <Button
      as={Link}
      to={to}
      primary
      disabled={disabled}
      loading={loading}
      onClick={onClick}
    >
      {content}
    </Button>,
    nextPortalTarget
  );
}
