import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import { UploadWallet } from '@the-coin/components/containers/UploadWallet';
import { Create as ConnectCreate } from './Connect/Create';
import { Existing as ConnectExist } from './Connect/Existing';
import { Restore } from './Restore';
import { CreateExistingSwitch } from './CreateExistingSwitch';
import { Generate } from './Generate';

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

const Upload = () => <UploadWallet readFile={readFile} />;

export const AddAccount = () => {

  const url = "/addAccount";// TODO
  return (
    <Switch>
      <Route path={`${url}/upload`} component={Upload} />
      <Route path={`${url}/generate`} component={Generate} />
      <Route path={`${url}/connect/exist`} component={ConnectExist} />
      <Route path={`${url}/connect/create`} component={ConnectCreate} />
      <Route path={`${url}/restore`} component={Restore} />
      <Route render={() => <CreateExistingSwitch url={`${url}/`} />} />
    </Switch>
  );
}

