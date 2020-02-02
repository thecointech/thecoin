import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import { Create as ConnectCreate } from './Connect/Create';
import { Existing as ConnectExist } from './Connect/Existing';
import { Restore } from './Restore';
import { CreateExistingSwitch } from './CreateExistingSwitch';
import { Generate } from './Generate/index';
import { FromJson } from './FromJson';


export const AddAccount = () => {

  const url = "/addAccount";// TODO
  return (
    <Switch>
      <Route path={`${url}/upload`} component={FromJson} />
      <Route path={`${url}/generate`} component={Generate} />
      <Route path={`${url}/connect/exist`} component={ConnectExist} />
      <Route path={`${url}/connect/create`} component={ConnectCreate} />
      <Route path={`${url}/restore`} component={Restore} />
      <Route path={`${url}/store`} component={FromJson} />
      <Route render={() => <CreateExistingSwitch url={`${url}/`} />} />
    </Switch>
  );
}

