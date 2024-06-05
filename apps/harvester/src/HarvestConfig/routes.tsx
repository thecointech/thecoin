import { Route, Switch } from 'react-router';
import { Intro } from './Step0.Intro';
import { DaysToRun } from './Step1.DaysToRun';
import { RoundUp } from './Step2.RoundUp';
import { TopUp } from './Step3.TopUp';
import { ChequeMinimum } from './Step4.ChequeMinimum';
import { TransferLimit } from './Step5.TransferLimit';
import { ProcessPercent } from './Step6.Percent';
import { Complete } from './Step7.Complete';
import { OverrideInitialBalance } from './Step7.OverrideInitialBalance';

export const routes = [
  {
    component: DaysToRun,
    title: "Schedule",
    description: "When to run",
  },
  {
    component: RoundUp,
    title: "Transfer Amount",
    description: "Tweak how much is transferred",
  },
  {
    component: TopUp,
    title: "Top Up",
    description: "Super-savings",
  },
  {
    component: ChequeMinimum,
    title: "Limits",
    description: "Balance Protection",
  },
  {
    component: TransferLimit,
    title: "Limits",
    description: "Upper Limit",
  },
  {
    component: ProcessPercent,
    title: "Percent",
    description: "Percent Used",
  },
  {
    component: Complete,
    title: "Complete",
    description: "Press Go!",
  },
]
// For now, hide the overrides
if (await window.scraper.allowOverrides()) {
  routes.push(  {
    component: OverrideInitialBalance,
    title: "Overrides",
    description: "Override",
  })
}

export const ConfigRouter = () => (
  <Switch>
    {
      routes.map((r, i) => <Route key={i} path={`/config/step${i}`} component={r.component} />)
    }
    <Route key="intro" component={Intro} />
  </Switch>
)
