import { useState, useEffect } from 'react';
import { Checkbox, Container, Input, Label, Message } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer';
import { safeParseFloat } from './state/utils';
import { HarvestStepType } from '@thecointech/store-harvester';

export const TransferLimit = () => {

  const data = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  const xferLimit = data.steps.find(step => step.type === HarvestStepType.TransferLimit);

  const [enabled, setEnabled] = useState(!!xferLimit ?? false);
  const [limit, setLimit] = useState(xferLimit?.args?.['limit'] ?? 2500);
  const [warning, setWarning] = useState<string>();

  useEffect(() => {
    if (enabled) {
      api.setStep(HarvestStepType.TransferLimit, {
        limit
      });
      setWarning(
        Number(limit) > 3000
          ? "Interac e-Transfer are often limited to $3000.  Are you sure you want to do this?"
          : undefined
      );
    }
    else {
      api.clearStep(HarvestStepType.TransferLimit)
    }
  }, [limit, api, enabled]);

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
      <Checkbox toggle label="Limit to" checked={enabled} onChange={(_, {checked}) => setEnabled(!!checked)}/>
        &nbsp;&nbsp;
        <Input placeholder="Amount" labelPosition="left" type="number" value={limit} onChange={(_, {value}) => setLimit(safeParseFloat(value))}>
          <Label basic>$</Label>
          <input />
        </Input>
      </div>
      {warning && <Message warning>{warning}</Message>}
    </Container>
  )
}
