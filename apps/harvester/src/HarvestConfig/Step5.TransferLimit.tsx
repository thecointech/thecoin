import { useState, useEffect } from 'react';
import { Checkbox, Container, Input, Label } from 'semantic-ui-react'
import { HarvestStepType } from '../types';
import { ConfigReducer } from './state/reducer';
import { safeParseFloat } from './state/utils';

export const TransferLimit = () => {

  const data = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  const xferLimit = data.steps.find(step => step.type === HarvestStepType.TransferLimit);

  const [limit, setLimit] = useState(xferLimit?.args?.['limit'] ?? 2500);

  useEffect(() => {
    api.setStep(HarvestStepType.TransferLimit, {
      limit
    });
  }, [limit]);

  return (
    <Container>
      <h4>Set limits on the Harvester</h4>
      <div>
        Interac Canada sets limits on how much money can be transferred each day.  The harvester
        needs to be able to keep within with these limits.
      </div>
      <div>
        The total maximum a single person can e-Transfer each day is $3000, however you may wish
        to set a lower limit in case you need to make transfers for other reasons.
      </div>
      <div>
      <Checkbox toggle label="Don't transfer more than " checked={true} />
        &nbsp;&nbsp;
        <Input placeholder="Amount" labelPosition="left" type="number" value={limit} onChange={(_, {value}) => setLimit(safeParseFloat(value))}>
          <Label basic>$</Label>
          <input />
        </Input>
      </div>
    </Container>
  )
}