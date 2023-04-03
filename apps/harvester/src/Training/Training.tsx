
import { Button } from 'semantic-ui-react'
import { Step0 } from './Step0.Intro'
import { Link, Outlet, RouteObject, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Warmup } from './Step1.Warmup';
import { ChequingBalance } from './Step2.ChequingBalance';
import { VisaBalance } from './Step3.VisaBalance';
import { SendETransfer } from './Step4.SendETransfer';
import { Complete } from './Step5.Complete';

export const Training = () => {
  // const params = useParams();
  // const step = parseInt(params.currIndex ?? '0');
  const [step, setStep] = useState(3);

  // <Step.Group ordered size='mini'>
  //   <Step completed>
  //     <Step.Content>
  //       <Icon name='truck' />
  //       <Step.Title>Intro</Step.Title>
  //       <Step.Description></Step.Description>
  //     </Step.Content>
  //   </Step>

  //   <Step completed>
  //     <Step.Content>
  //       <Icon name='truck' />
  //       <Step.Title>Warm-up</Step.Title>
  //       <Step.Description>Start the engine</Step.Description>
  //     </Step.Content>
  //   </Step>

  //   <Step active>
  //     <Step.Content>
  //       <Step.Title>Confirm Order</Step.Title>
  //     </Step.Content>
  //   </Step>
  // </Step.Group>
  return (
    <div>
      <div>
        {/* <Link to={step + 1} />
        <Link to={step + 1} /> */}
        <Button onClick={() => setStep(Math.max(step - 1, 0))}>Back</Button>
        <Button onClick={() => setStep(Math.min(step + 1, 5))}>Next</Button>
      </div>
      <h2>Doing step: {step} of 5</h2>
      {
        [
          <Step0 />,
          <Warmup />,
          <ChequingBalance />,
          <VisaBalance />,
          <SendETransfer />,
          <Complete />,
        ][step] ?? <Step0 />
      }
    </div>
  )
}

export const trainingRoutes: RouteObject[] = [
  {
    path: "train",
    element: <Training />,
    // children: [
    //   {
    //     index: true,
    //     element: <Step0 />,
    //   },
    //   {
    //     path: "1",
    //     element: <h1>Dashboard</h1>,
    //   },
    //   {
    //     path: "2",
    //     element: <h1>About</h1>,
    //   },
    // ]
  }
]