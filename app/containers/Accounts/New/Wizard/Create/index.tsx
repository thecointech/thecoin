import React, { useState } from 'react';
import { Step, Container } from 'semantic-ui-react';
import { RouteComponentProps } from 'react-router';
import { Option } from '../Options/Types';
import queryString from 'query-string';
import { CreatePasswordPage, CreatePasswordStep } from './Passwords';
import { CreateAccountPage, CreateAccountStep } from './Account';
import { InstallMetamaskPage, InstallMetamaskStep } from './Metamask';
import { CreateIntroStep, CreateIntroPage } from './Intro';
import { CloudStorageStep, CloudStoragePage } from './CloudStorage';
import { OfflineStorageStep, OfflineStoragePage } from './OfflineStorage';

type MyProps = {};
type Props = MyProps & RouteComponentProps;

export type PageProps = {
  accountName: string,
  setName: (name: string) => void,
  buttonText: string,
  onComplete: () => void
}


function GetOptions(qs: string) {
  const query = queryString.parse(qs);
  const options = query.options as string;
  if (!options) return null;
  return JSON.parse(options) as Option;
}

type WizardPage = (props: PageProps) => React.ReactNode
type StepPair = [() => React.ReactNode, WizardPage];
function BuildSteps(option: Option) {
  const steps: StepPair[] = [];
  steps.push([CreateIntroStep, CreateIntroPage])
  if (option.password == "lastpass" || option.stored == 'offline')
    steps.push([CreatePasswordStep, CreatePasswordPage]);
  if (option.stored == 'metamask')
    steps.push([InstallMetamaskStep, InstallMetamaskPage]);
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
  
  return steps;
}


export const Create = (props: Props) => {
  const options = GetOptions(props.location.search);
  if (!options) return <div>error: no query provided</div>;
  const steps = BuildSteps(options);

  const [step, setStep] = useState(0);
  const [accountName, setName] = useState("");
  const lastStep = steps.length - 1;
  const nextPage = step == lastStep ? undefined : () => setStep(step + 1) ;
  const buttonText = step == lastStep ? 'DONE' : 'NEXT';

  const pageProps: PageProps = {
    accountName,
    setName,
    buttonText,
    onComplete: nextPage || (() => {})
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
        <CloudStoragePage {...pageProps} />
        {/*steps[step][1](pageProps)*/}
      </Container>
    </>
  );
};
