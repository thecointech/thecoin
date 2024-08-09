import { Route, Switch } from 'react-router';
import { Step0 } from './Step0.Intro';
import { CreditDetails } from './Step1.CreditDetails';
import { Warmup } from './Step2.Warmup';
import { ChequingBalance } from './Step3.ChequingBalance';
import { VisaBalance } from './Step4.VisaBalance';
import { SendETransfer } from './Step5.SendETransfer';
import { Complete } from './Step6.Complete';

export const TrainingRouter = () => (
  <Switch>
    <Route path="/train/step0" component={Step0} />
    <Route path="/train/step1" component={CreditDetails} />
    <Route path="/train/step2" component={Warmup} />
    <Route path="/train/step3" component={ChequingBalance} />
    <Route path="/train/step4" component={VisaBalance} />
    <Route path="/train/step5" component={SendETransfer} />
    <Route path="/train/step6" component={Complete} />
    <Route component={Step0} />
  </Switch>
)
