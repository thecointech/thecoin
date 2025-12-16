import { createContext, useContext } from 'react';

// The ContentSection context is used to allow
// content to define their next/action/alternate
// buttons, but the rendering is hoisted
// into the ContentSection.footer.

type ContentSectionContextType = {
  alternatePortalTarget: HTMLElement | null;
  nextPortalTarget: HTMLElement | null;
  setHasAlternate: (hasAlternate: boolean) => void;
  setHasNext: (hasNext: boolean) => void;
};

export const ContentSectionContext = createContext<ContentSectionContextType | null>(null);

export const useContentSectionContext = () => {
  const context = useContext(ContentSectionContext);
  if (!context) {
    throw new Error('ContentSection.Action, ContentSection.Alternate, and ContentSection.Next must be used within a ContentSection');
  }
  return context;
};
