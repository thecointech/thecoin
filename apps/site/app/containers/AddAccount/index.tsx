import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import { Create as ConnectCreate } from './Connect/Create';
import { Existing as ConnectExist } from './Connect/Existing';
import { Store } from './Store';
import { Restore } from './Restore';
import { CreateExistingSwitch } from './CreateExistingSwitch';
import { Generate } from './Generate/index_old';
import { Upload } from './Upload';


export const AddAccount = () => {

  const url = "/addAccount";// TODO
  return (
    <Switch>
      <Route path={`${url}/upload`} component={Upload} />
      <Route path={`${url}/generate`} component={Generate} />
      <Route path={`${url}/connect/exist`} component={ConnectExist} />
      <Route path={`${url}/connect/create`} component={ConnectCreate} />
      <Route path={`${url}/store`} component={Store} />
      <Route path={`${url}/restore`} component={Restore} />
      <Route render={() => <CreateExistingSwitch url={`${url}/`} />} />
    </Switch>
  );
}

