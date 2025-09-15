import { useEffect, useState } from 'react';
import { Checkbox, Container, Input } from 'semantic-ui-react'
import { HarvestStepType } from '@thecointech/store-harvester';
import { ConfigReducer } from './state/reducer';
import { safeParseFloat } from './state/utils';

export const TopUp = () => {
  const data = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  const topUpStep = data.steps.find(step => step.type === HarvestStepType.TopUp);

  const [enabled, setEnabled] = useState(!!topUpStep ?? false);
  const [topUp, setTopUp] = useState(topUpStep?.args?.['topUp'] ?? 10);

  useEffect(() => {
    if (enabled) {
      api.setStep(HarvestStepType.TopUp, {
        topUp
      });
    }
    else {
      api.clearStep(HarvestStepType.TopUp);
    }
  }, [enabled, topUp]);

  return (
    <Container>
      <h4>Would you like to make optional top-ups</h4>
      <div>
        Sometimes saving is easiest if it happens automatically.
      </div>
      <div>
        You can add an additional top-up over the base balance by adding a top-up amount.
        Each month, the harvester will set aside the amount specified here.  The top-up
        will be protected by TheCoin's no-loss ShockAbsorber feature, while also continuing
        to grow along with the stock market.  You will be pleasantly surprised by
        how painless it is, and even more by how much the top-up will be worth.
      </div>
      <div>
        <Checkbox toggle label="Additional Top-up" checked={enabled} onChange={(_, {checked}) => setEnabled(!!checked)}/>
        <Input placeholder="Amount" value={topUp} onChange={(_, {value}) => setTopUp(safeParseFloat(value))}/>
      </div>
    </Container>
  )
}
