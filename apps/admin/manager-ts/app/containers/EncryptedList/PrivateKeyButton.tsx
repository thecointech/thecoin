import React, { useCallback } from "react";
import fs from 'fs';
import { Button } from "semantic-ui-react";



export const PrivateKeyButton = (props: {setPrivateKey: (v: string) => void}) => {

  const onPkSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (!files)
      throw("Empty or Missing FileList");
  
    const file = files[0];
    console.log("Loading PK: " + file.name);
    const privateKey = fs.readFileSync(file.path);
    props.setPrivateKey(privateKey.toString())
  }, []);

  return (
    <>
      <Button as="label" htmlFor="file" type="button">
        Select Private Key
      </Button>
      <input type="file" id="file" accept=".pem" hidden onChange={onPkSelected} />
    </>
  )
}