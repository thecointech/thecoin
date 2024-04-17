import { Route, Switch } from 'react-router';
import { Intro } from './Step0.Intro';
import { DaysToRun } from './Step1.DaysToRun';
import { RoundUp } from './Step2.RoundUp';
import { TopUp } from './Step3.TopUp';
import { ChequeMinimum } from './Step4.ChequeMinimum';
import { TransferLimit } from './Step5.TransferLimit';
import { Complete } from './Step6.Complete';
import { OverrideInitialBalance } from './Step6.OverrideInitialBalance';

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
    component: Complete,
    title: "Complete",
    description: "Press Go!",
  },
]
// For now, hide the overrides
if (window.AllowOverrides) {
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
    {/* <Route path="/config/step1" component={DaysToRun} />
    <Route path="/config/step2" component={RoundUp} />
    <Route path="/config/step3" component={TopUp} />
    <Route path="/config/step4" component={ChequeMinimum} />
    <Route path="/config/step5" component={TransferLimit} />
    <Route path="/config/step6" component={Complete} />
    <Route path="/config/step7" component={OverrideInitialBalance} /> */}
    <Route key="intro" component={Intro} />
  </Switch>
)
