import * as React from 'react';
import { Routes, Route } from 'react-router';

import { Create as ConnectCreate } from './Connect/Create';
import { Existing as ConnectExist } from './Connect/Existing';
import { Restore } from './Storage/Restore';
import { CreateExistingSwitch } from './CreateExistingSwitch';
import { Generate } from './Generate';
import { Intro } from './Generate/Intro';
import { FromJson } from './FromJson';
import { Store } from './Storage/Store';
import { RestoreList } from './Storage/GDrive/RestoreList';
import styles from './styles.module.less';


export const AddAccount = () => {

  const url = "/addAccount";// TODO
  return (
    <div className={styles.addAccountWrapper}>
      <Routes>
        <Route path={`${url}/upload`} element={<FromJson />} />
        <Route path={`${url}/generate/intro`} element={<Intro />} />
        <Route path={`${url}/generate`} element={<Generate />} />
        <Route path={`${url}/connect/exist`} element={<ConnectExist />} />
        <Route path={`${url}/connect/create`} element={<ConnectCreate />} />
        <Route path={`${url}/restore/list`} element={<RestoreList />} />
        <Route path={`${url}/restore`} element={<Restore />} />
        <Route path={`${url}/store`} element={<Store />} />
        <Route element={<CreateExistingSwitch url={`${url}/`} />} />
      </Routes>
    </div>
  );
}
