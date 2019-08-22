import React, { useState } from 'react';
import { Step, Container } from 'semantic-ui-react';
import { RouteComponentProps } from 'react-router';
import { Option } from '../Options/Types';
import { CreatePasswordPage, CreatePasswordStep } from './Passwords';
import { CreateAccountPage, CreateAccountStep } from './Account';
import { InstallMetamaskPage, InstallMetamaskStep } from './Metamask/Metamask';
import { CreateIntroStep, CreateIntroPage } from './Intro';
import { CloudStorageStep, CloudStoragePage } from './CloudStorage/index';
import { ConnectWeb3Step, ConnectWeb3Page } from './ConnectWeb3';
import { InstallOperaStep, InstallOperaPage } from './Opera/index';
import { PageProps } from './PageProps';
import { GetOptions, BuildCreateUrl } from './Types';
import { OfflineStorageStep, OfflineStoragePage } from './OfflineStorage';
// import { OnlineStorageStep, OnlineStoragePage } from './OnlineStorage/index';

type Props = RouteComponentProps;

type WizardStep = React.FunctionComponent<{}>;
type WizardPage = React.FunctionComponent<PageProps>;
type StepPair = [WizardStep, WizardPage];
function BuildSteps(option: Option) {
  const steps: StepPair[] = [];
  steps.push([CreateIntroStep, CreateIntroPage]);
  if (option.password === 'lastpass' || option.stored === 'offline' || option.stored === 'cloud' || option.stored === 'metamask') {
    steps.push([CreatePasswordStep, CreatePasswordPage]);
  }
  if (option.stored === 'metamask') {
    steps.push([InstallMetamaskStep, InstallMetamaskPage]);
  }
  if (option.stored === 'opera') {
    steps.push([InstallOperaStep, InstallOperaPage]);
  }
  if (option.stored === 'metamask' || option.stored === 'opera') {
    steps.push([ConnectWeb3Step, ConnectWeb3Page]);
  }
  if (
    option.stored === 'cloud' ||
    option.stored === 'offline' ||
    option.stored === 'safetyBox'
  ) {
    steps.push([CreateAccountStep, CreateAccountPage]);
  }
  if (option.stored === 'cloud') {
    steps.push([CloudStorageStep, CloudStoragePage]);
  }
  if (option.stored === 'offline') {
    steps.push([OfflineStorageStep, OfflineStoragePage]);
  }

  // steps.push([CreateBackupStep, CreateBackupPage])

  return steps;
}


export const Create = (props: Props) => {
  const [accountName, setName] = useState('');
  const options = GetOptions(props.location.search);
  if (!options) {
    return <div>error: no query provided</div>;
  }
  const steps = BuildSteps(options);
  const step = options.step || 0;
  const lastStep = steps.length - 1;

  const nextPage = React.useCallback(() => {
    // We want to add which step we are on to the URL
    // This is so a user can refresh the page and end up
    // at the same part of the creation process
    options.step = (options.step || 0) + 1;
    props.history.push(BuildCreateUrl(options));
  }, []);
  const buttonText = step === lastStep ? 'DONE' : 'NEXT';

  const pageProps: PageProps = {
    accountName,
    setName,
    buttonText,
    onComplete: nextPage,
    options,
  };

  const stepNodes = steps.map((pair, i) => {
    // Remove introduction if more than 3 items
    if (i === 0 && (steps.length > 3)) {
      return undefined;
    }
    const Item = pair[0];
    return (
    <Step key={i} active={i === step}>
      <Item />
    </Step>
    );
  });

  const Page = steps[step][1];
  return (
    <>
      <Step.Group size="small">
        {...stepNodes}
      </Step.Group>
      <Container>
        <Page {...pageProps} />
      </Container>
    </>
  );
};
