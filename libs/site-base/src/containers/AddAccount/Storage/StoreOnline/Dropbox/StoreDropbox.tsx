import React, { type PropsWithChildren } from "react";

export const StoreDropbox = ({ children }: PropsWithChildren<{}>) => {

    return (
      <>
        <a>
            {children}
        </a>
      </>
    );
  }
