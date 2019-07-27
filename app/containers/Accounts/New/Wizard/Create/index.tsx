import React, { useState } from 'react';
import { Step, Container } from 'semantic-ui-react';
import { RouteComponentProps } from 'react-router';
import { Option } from '../Options/Types';
import { CreatePasswordPage, CreatePasswordStep } from './Passwords';
import { CreateAccountPage, CreateAccountStep } from './Account';
import { InstallMetamaskPage, InstallMetamaskStep } from './Metamask';
import { CreateIntroStep, CreateIntroPage } from './Intro';
import { CloudStorageStep, CloudStoragePage } from './CloudStorage';
import { OfflineStorageStep, OfflineStoragePage } from './OfflineStorage';
import { ConnectWeb3Step, ConnectWeb3Page } from './ConnectWeb3';
import { InstallOperaStep, InstallOperaPage } from './Opera/index';
import { PageProps } from './PageProps';
import { GetOptions, BuildCreateUrl } from './types';
import { CreateBackupStep, CreateBackupPage } from './Backup/index';

type MyProps = {};
type Props = MyProps & RouteComponentProps;

type WizardPage = (props: PageProps) => React.ReactNode
type StepPair = [() => React.ReactNode, WizardPage];
function BuildSteps(option: Option) {
  const steps: StepPair[] = [];
  steps.push([CreateIntroStep, CreateIntroPage])
  if (option.password == "lastpass" || option.stored == 'offline')
    steps.push([CreatePasswordStep, CreatePasswordPage]);
  if (option.stored == 'metamask') {
    steps.push([InstallMetamaskStep, InstallMetamaskPage]);
  }
  if (option.stored == 'opera') {
    steps.push([InstallOperaStep, InstallOperaPage]);
  }
  if (option.stored == "metamask" || option.stored == "opera")
  {
    steps.push([ConnectWeb3Step, ConnectWeb3Page]);
  }
  if (
    option.stored == 'cloud' ||
    option.stored == 'offline' ||
    option.stored == 'safetyBox'
  )
  {
    steps.push([CreateAccountStep, CreateAccountPage]);
  }
  if (option.stored == 'cloud')
    steps.push([CloudStorageStep, CloudStoragePage])
  if (option.stored == 'offline')
    steps.push([OfflineStorageStep, OfflineStoragePage])

  steps.push([CreateBackupStep, CreateBackupPage])
  
  return steps;
}


export const Create = (props: Props) => {
  const options = GetOptions(props.location.search);
  if (!options) return <div>error: no query provided</div>;
  const steps = BuildSteps(options);
  const [step, setStep] = useState(options.step || 0);
  const [accountName, setName] = useState("");
  const lastStep = steps.length - 1;
  const nextPage = step == lastStep ? undefined : () => {
    // We want to add which step we are on to the URL
    // This is so a user can refresh the page and end up
    // at the same part of the creation process
    const newStep = step + 1;
    options.step = newStep
    props.history.replace(BuildCreateUrl(options));
    setStep(newStep);
  }
  const buttonText = step == lastStep ? 'DONE' : 'NEXT';

  const pageProps: PageProps = {
    accountName,
    setName,
    buttonText,
    onComplete: nextPage || (() => {}),
    options
  }

  const stepNodes = steps.map((pair, i) => (
    <Step key={i} active={i == step}>
      {pair[0]()}
    </Step>
  ))
  return (
    <>
      <Step.Group size="small">
        {...stepNodes}
      </Step.Group>
      <Container>
        {steps[step][1](pageProps)}
      </Container>
    </>
  );
};
