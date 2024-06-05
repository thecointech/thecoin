import { useState, useEffect } from 'react';
import { Checkbox, Container, Input, Label } from 'semantic-ui-react'
import { HarvestStepType } from '../types';
import { ConfigReducer } from './state/reducer';
import { safeParseFloat } from './state/utils';

export const ProcessPercent = () => {

  const data = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  const processPercent = data.steps.find(step => step.type === HarvestStepType.ProcessPercent);

  const [enabled, setEnabled] = useState(!!processPercent);
  const [percent, setPercent] = useState(processPercent?.args?.['percent'] ?? 100);

  useEffect(() => {
    if (enabled) {
      api.setStep(HarvestStepType.ProcessPercent, {
        percent
      });
    }
    else {
      api.clearStep(HarvestStepType.ProcessPercent)
    }
  }, [enabled, percent]);

  return (
    <Container>
      <h4>What percentage of your visa balance do you want to handle?</h4>
      <div>
        While you will get the best results if the harvester is running at 100%, you may be more comfortable
        starting out with it hanlding a smaller percentage of your visa balance.
      </div>
      <div>
        For example, if you set the percentage handled to 50%, the harvester will transfer 50% of the balance owing,
        and pay off 50% of the due amount.  You will need to ensure the remainder is paid off yourself, and you will only earn 50% of
        your potential profits.
      </div>
      <div>
        This setting allows you to explore the harvester without a full commitment.  Once you are confident in your
        setup though you'll want to earn 100% of your profits.
      </div>
      <div>
      <Checkbox toggle label="Limit to" checked={enabled} onChange={(_, {checked}) => setEnabled(!!checked)}/>
        &nbsp;&nbsp;
        <Input placeholder="Percent" labelPosition="right" type="number" min={0} max={100} step={5} value={percent} onChange={(_, {value}) => setPercent(safeParseFloat(value))}>
          <Label basic>%</Label>
          <input />
        </Input>
      </div>
    </Container>
  )
}
