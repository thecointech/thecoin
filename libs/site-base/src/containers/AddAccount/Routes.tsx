import React from 'react';
import { Outlet, type RouteObject } from 'react-router';
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

const AddAccountWrapper = () => (
  <div className={styles.addAccountWrapper}>
    <Outlet />
  </div>
)

export const routes = [
  {
    path: '*',
    element: <AddAccountWrapper />,
    children: [
      { index: true, element: <CreateExistingSwitch /> },
      { path: 'upload', element: <FromJson /> },
      { path: 'generate/intro', element: <Intro /> },
      { path: 'generate', element: <Generate /> },
      { path: 'connect/exist', element: <ConnectExist /> },
      { path: 'connect/create', element: <ConnectCreate /> },
      { path: 'restore/list', element: <RestoreList /> },
      { path: 'restore', element: <Restore /> },
      { path: 'store', element: <Store /> },
    ]
  }
] as const satisfies RouteObject[];
