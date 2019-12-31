import React from "react"
import { Container } from "semantic-ui-react"
import { ExistsSwitcher } from "containers/AddAccount/ExistsSwitcher"
import { UploadWallet } from "@the-coin/shared/containers/UploadWallet"


function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const target: any = e.target;
      const data = target.result;
      resolve(data);
    };
    reader.readAsText(file);
  });
}

export const Upload = () => {
  
  return (
    <Container>
      <UploadWallet readFile={readFile}/>
      <ExistsSwitcher filter="upload" />
    </Container>
  );
}
