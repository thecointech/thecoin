import { type RouteObject } from 'react-router';
import { Step0 } from './Step0.Intro';
import { CreditDetails } from './Step1.CreditDetails';
import { Warmup } from './Step2.Warmup';
import { ChequingBalance } from './Step3.ChequingBalance';
import { VisaBalance } from './Step4.VisaBalance';
import { SendETransfer } from './Step5.SendETransfer';
import { Complete } from './Step6.Complete';


export const routes = [
  { path: 'step0', element: <Step0 /> },
  { path: 'step1', element: <CreditDetails /> },
  { path: 'step2', element: <Warmup /> },
  { path: 'step3', element: <ChequingBalance /> },
  { path: 'step4', element: <VisaBalance /> },
  { path: 'step5', element: <SendETransfer /> },
  { path: 'step6', element: <Complete /> },
  { path: '*', element: <Step0 /> },
] as const satisfies RouteObject[]
