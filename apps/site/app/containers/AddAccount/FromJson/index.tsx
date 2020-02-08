import React from "react"
import { Container } from "semantic-ui-react"
import { ExistsSwitcher } from "containers/AddAccount/ExistsSwitcher"
import { UploadWallet, ReadFileData } from "@the-coin/shared/containers/UploadWallet"


function readFile(file: File): Promise<ReadFileData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const target = e.target;
      resolve({
        wallet: target?.result as string,
        name: undefined
      });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export const FromJson = () => {
  
  return (
    <Container id="formCreateAccountStep1">
      <UploadWallet readFile={readFile}/>
      <ExistsSwitcher filter="upload" />
    </Container>
  );
}
