import { useState, useEffect } from 'react';
import { Checkbox, Container, Input, Label, Header } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer';
import { safeParseFloat } from './state/utils';
import { HarvestStepType } from '@thecointech/store-harvester';

export const ChequeMinimum = () => {

  const data = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  const xferLimit = data.steps.find(step => step.type === HarvestStepType.ChequeMinimum);

  const [enabled, setEnabled] = useState(!!xferLimit ?? false);
  const [limit, setLimit] = useState(xferLimit?.args?.['limit'] ?? 250);

  useEffect(() => {
    if (enabled) {
      api.setStep(HarvestStepType.ChequeMinimum, {
        limit
      });
    }
    else {
      api.clearStep(HarvestStepType.ChequeMinimum);
    }
  }, [enabled, limit]);

  return (
    <Container>
      <Header size="small">Set limits on the Harvester</Header>
      <div>
        The harvester is designed to make your life better.  However, sometimes there just isn't enough
        cash to go around.  For those months, it's a good idea to give it limits.
      </div>
      <div>
        Here we set the minimum balance on your chequing account.  The harvester will never
        take more than this amount.  It's a good idea to keep this minimum low.  Setting it too
        high might prevent the harvester from paying off your credit bill - which means you
        might end up paying more in interest than the harvester can earn.
      </div>
      <div>
      <Checkbox toggle label="Leave at least " checked={enabled} onChange={(_, {checked}) => setEnabled(!!checked)}/>
        &nbsp;&nbsp;
        <Input placeholder="Amount" labelPosition="left" type="number" value={limit} onChange={(_, {value}) => setLimit(safeParseFloat(value))}>
          <Label basic>$</Label>
          <input />
        </Input>
      </div>
    </Container>
  )
}
