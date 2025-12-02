import { Path } from "./types";
import { createContext, useContext } from 'react';

// NOTE: Path is included here to allow
// PathNextButton to find it's next path.
// That's a lil hacky, as Next is part
// of SimplePath, but it's the least
// change option.
// so if you see this comment in the future
// and have a better idea, please know I'm
// sorry, then spend a day fixing it yourself.
type SimplePathContextType<T> = {
  data: T;
  path: Path<T>;
  // Can be set by the active Page
  // applied to the "Next" button
  onValidate?: () => boolean;
};

export const SimplePathContext = createContext<SimplePathContextType<any> | null>(null);
export const useSimplePathContext = <T, >(): SimplePathContextType<T> => {
  const context = useContext(SimplePathContext);
  if (!context) {
    throw new Error('ContentSection.Action, ContentSection.Alternate, and ContentSection.Next must be used within a ContentSection');
  }
  return context;
};
