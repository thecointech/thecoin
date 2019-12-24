import React, { useCallback } from "react";
import fs from 'fs';
import { Button } from "semantic-ui-react";

type Props = {
  hasKey: boolean;
  setPrivateKey: (v: string) => void;
}

export const PrivateKeyButton = (props: Props) => {

  const onPkSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (!files)
      throw("Empty or Missing FileList");
  
    const file = files[0];
    console.log("Loading PK: " + file.name);
    const privateKey = fs.readFileSync(file.path);
    props.setPrivateKey(privateKey.toString())
  }, []);

  return props.hasKey 
    ? <></>
    : (
        <>
          <Button as="label" htmlFor="file" type="button">
            Select Private Key
          </Button>
          <input type="file" id="file" accept=".pem" hidden onChange={onPkSelected} />
        </>
      );
}