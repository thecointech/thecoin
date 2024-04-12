import { Route, Switch } from 'react-router';
import { Intro } from './Step0.Intro';
import { DaysToRun } from './Step1.DaysToRun';
import { RoundUp } from './Step2.RoundUp';
import { TopUp } from './Step3.TopUp';
import { TransferLimit } from './Step4.TransferLimit';
import { Complete } from './Step5.Complete';
import { OverrideInitialBalance } from './Step6.OverrideInitialBalance';

export const ConfigRouter = () => (
  <Switch>
    <Route path="/config/step1" component={DaysToRun} />
    <Route path="/config/step2" component={RoundUp} />
    <Route path="/config/step3" component={TopUp} />
    <Route path="/config/step4" component={TransferLimit} />
    <Route path="/config/step5" component={Complete} />
    <Route path="/config/step6" component={OverrideInitialBalance} />
    <Route component={Intro} />
  </Switch>
)
