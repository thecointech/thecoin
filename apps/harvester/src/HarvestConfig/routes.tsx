import { Routes } from '@/SimplePath/types';
import { Intro } from './Step0.Intro';
import { DaysToRun } from './Step1.DaysToRun';
import { RoundUp } from './Step2.RoundUp';
import { TopUp } from './Step3.TopUp';
import { ChequeMinimum } from './Step4.ChequeMinimum';
import { TransferLimit } from './Step5.TransferLimit';
import { ProcessPercent } from './Step6.Percent';
import { Complete } from './Step7.Complete';


export const groupKey = "config";

export const routes = [
  {
    path: "intro",
    component: Intro,
    title: "Intro",
    description: "Last step",
  },
  {
    path: "days",
    component: DaysToRun,
    title: "Schedule",
    description: "When to run",
  },
  {
    path: "roundup",
    component: RoundUp,
    title: "Transfer Amount",
    description: "Tweak how much is transferred",
  },
  {
    path: "topup",
    component: TopUp,
    title: "Top Up",
    description: "Super-savings",
  },
  {
    path: "chequemin",
    component: ChequeMinimum,
    title: "Limits",
    description: "Balance Protection",
  },
  {
    path: "transferlimit",
    component: TransferLimit,
    title: "Limits",
    description: "Upper Limit",
  },
  {
    path: "percent",
    component: ProcessPercent,
    title: "Percent",
    description: "Percent Used",
  },
  {
    path: "complete",
    component: Complete,
    title: "Complete",
    description: "Press Go!",
  },
] as const satisfies Routes[];

export const path = {
  groupKey,
  routes,
}
