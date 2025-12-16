import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { Link } from "react-router"
import { Button } from "semantic-ui-react"
import { useContentSectionContext } from './context'

type NextButtonProps = {
  to: string;
  disabled?: boolean;
  loading?: boolean;
  onValid?: () => boolean;
}

export const NextButton = ({ to, disabled, loading, onValid }: NextButtonProps) => {
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
      Next
    </Button>,
    nextPortalTarget
  );
}
